import "dotenv/config";
import fastify from "fastify";
import cors from "fastify-cors";
import serve from "fastify-static";
import { join, dirname } from "path";
import multipart from "fastify-multipart";

import { parseEnv } from "./parseEnv";
import { createUploader } from "./createUploader";
import { makeResizeFileName, resize } from "./resize";

const { PORT, HOST, MAX_SIZE_MB, ALLOWED_ORIGINS, VALID_SIZES } = parseEnv({
  PORT: 4242,
  HOST: "0.0.0.0",
  MAX_SIZE_MB: 20,
  ALLOWED_ORIGINS: ["*"],
  VALID_SIZES: [400],
});

const dest = join(dirname(__dirname), "images");
const upload = createUploader(dest);

console.log(ALLOWED_ORIGINS);

const app = fastify();
app.register(cors, { origin: ALLOWED_ORIGINS });
app.register(multipart, { addToBody: true });
app.register(serve, { root: dest, serve: false });

app.route({
  method: "POST",
  url: "/upload",
  preHandler: upload.single("file", { MAX_SIZE_MB }),
  handler: async (req) => req.file,
});

app.route<{
  Params: { filename: string };
  Querystring: { h?: string; w?: string };
}>({
  method: "GET",
  url: "/:filename",
  preHandler: resize(VALID_SIZES),
  async handler(req, rep) {
    const filename = makeResizeFileName(
      req.params.filename,
      req.query.h,
      req.query.w
    );

    return rep.sendFile(filename);
  },
});

app
  .listen(PORT, HOST)
  .then(console.log)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
