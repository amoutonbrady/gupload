import { join, dirname, parse } from "path";
import { preHandlerHookHandler } from "fastify";
import { pathExists, readFile } from "fs-extra";
import sharp from "sharp";

export const makeResizeFileName = (
  file: string,
  height?: string,
  width?: string
) => {
  if (!height && !width) return file;

  const { name, ext } = parse(file);
  const filename = `${name}-${height}x${width}${ext}`;

  return filename;
};

export const resize: (validSizes: number[]) => preHandlerHookHandler = (
  validSizes
) => async (req, rep, done) => {
  const query = req.query as { h?: string; w?: string };
  const params = req.params as { filename: string };
  const dest = join(dirname(__dirname), "images");
  const originalDest = join(dest, params.filename);

  if (query.h && query.w) {
    if (validSizes.includes(+query.h) || validSizes.includes(+query.w)) {
      done();
      return;
    }

    const filename = makeResizeFileName(params.filename, query.h, query.w);
    const finalDest = join(dest, filename);

    const alreadyExists = await pathExists(finalDest);
    if (alreadyExists) return done();

    const originalFile = await readFile(originalDest);

    sharp(originalFile)
      .resize(+query.w, +query.h)
      .toFile(finalDest)
      .then(() => done());
  } else done();
};
