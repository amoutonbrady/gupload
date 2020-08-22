import hasha from "hasha";
import { join, extname } from "path";
import { preHandlerHookHandler } from "fastify";
import { pathExistsSync, outputFile } from "fs-extra";

export function createUploader(dest: string) {
  const single: (fieldname: string, config: Config) => preHandlerHookHandler = (
    fieldname,
    config
  ) => async (req, rep, done) => {
    if (!req.isMultipart()) {
      rep.code(400).send(new Error("Request is not multipart"));
      return;
    }

    const body = (req.body as unknown) as Record<string, WTF[]>;
    const file = body[fieldname] && body[fieldname][0];
    const fileSize = file.data.byteLength / 1e6;

    if (!file) {
      rep.code(400).send(new Error("file is not set"));
      return;
    }

    if (!/image\/.*/g.test(file.mimetype)) {
      rep.code(400).send(new Error("file needs to be of mimetype image/*"));
      return;
    }

    if (fileSize > config.MAX_SIZE_MB) {
      rep
        .code(400)
        .send(
          new Error(
            `file size too big. Got ${fileSize}mb, limit is: ${config.MAX_SIZE_MB}mb`
          )
        );
      return;
    }

    const extension = extname(file.filename);
    const md5 = hasha(file.data, { algorithm: "md5" });

    const name = md5 + extension;
    const finalDestination = join(dest, name);
    const alreadyExist = pathExistsSync(finalDestination);

    if (!alreadyExist) await outputFile(finalDestination, file.data);

    req.file = {
      fieldname,
      filename: name,
      mimetype: file.mimetype,
      originalname: file.filename,
      size: file.data.byteLength,
    };

    done();
  };

  return { single };
}

declare module "fastify" {
  interface FastifyRequest {
    file: File;
  }
}

interface File {
  fieldname: string;
  originalname: string;
  mimetype: string;
  filename: string;
  size: number;
}
interface WTF {
  data: Buffer;
  encoding: string;
  filename: string;
  limit: boolean;
  mimetype: string;
}
interface Config {
  MAX_SIZE_MB: typeof Infinity | number;
}
