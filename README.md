# Gupload

An easy file uploading solution for simple uploads needs

## Usage

- `[GET] /:filename`
  - Query: If you only pass one of those parameters, the original image will be sent
    - `h`: number // Height of the image
    - `w`: number // Width of the image
- `[POST] /upload`
  - Body: The body needs to have a field named File and a content-type `multipart/form-data;`
    - `file`: File;

## Example

```bash
# Upload

curl --location --request POST 'http://0.0.0.0:3000/upload' --form 'file=@/path/to/file'
# Response:
# {
#    "fieldname": "file",
#    "filename": "058c03293925ead7a559216a877d1bc1.jpg",
#    "mimetype": "image/jpeg",
#    "originalname": "pexels-pixabay-36717.jpg",
#    "size": 152231
# }
```

```bash
# Fetch

curl --location --request GET 'http://0.0.0.0:3000/058c03293925ead7a559216a877d1bc1.jpg'
# Response:
# The image!

curl --location --request GET 'http://0.0.0.0:3000/058c03293925ead7a559216a877d1bc1.jpg?w=400&h=400'
# Response:
# The image in 400x400 (granted we allowed this in the conf)!
```

## Running

Dockerfile:

`$ docker run -p 3000:3000 -v ./.images:/var/www/images amoutonbrady/gupload`

Docker-compose:

```yaml
version: "3.8"

services:
  img:
    image: amoutonbrady/gupload
    environments:
      - MAX_SIZE_MB=20
      - VALID_SIZES=[400]
      - ALLOWED_ORIGINS=["http://0.0.0.0:3000/"]
    ports:
      - "3000:3000"
    volumes:
      - ./.images:/var/www/images
```

## Configuration & defaults

Configration is done through env variables.

| Variable          | Description                          | Type       | Default                  |
| ----------------- | ------------------------------------ | ---------- | ------------------------ |
| `MAX_SIZE_MB`     | Maximum size per file in MB          | `number`   | 20                       |
| `VALID_SIZES`     | List of sizes available for resizing | `number[]` | [400]                    |
| `ALLOWED_ORIGINS` | List of allowed origins for CORS     | string[]   | ["http://0.0.0.0:3000/"] |

## Technologies used

- [Fastify](https://www.fastify.io/): Fast HTTP server with a wide ecosystem of plugins
- [Sharp](https://sharp.pixelplumbing.com/): Image manipulation library (used to resize images)
- [Hasha](https://github.com/sindresorhus/hasha): md5 generation helper
