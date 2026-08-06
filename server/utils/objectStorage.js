const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const configured = () => !!(
  process.env.AWS_BUCKET &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
);

let client = null;

function getClient() {
  if (!configured()) return null;
  if (!client) {
    client = new S3Client({
      region: process.env.AWS_REGION || 'auto',
      endpoint: process.env.AWS_ENDPOINT || undefined,
      forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

function publicBase() {
  return process.env.AWS_PUBLIC_URL ? process.env.AWS_PUBLIC_URL.replace(/\/+$/, '') : null;
}

async function uploadFile({ key, filePath, contentType }) {
  const c = getClient();
  if (!c) return null;
  const body = fs.readFileSync(filePath);
  await c.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType || 'application/octet-stream',
    })
  );
  const base = publicBase();
  if (base) return `${base}/${key}`;
  return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

async function deleteFile(key) {
  const c = getClient();
  if (!c || !key) return;
  try {
    await c.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: key }));
  } catch (err) {
    console.error(`[objectStorage] delete failed key=${key}: ${err.message}`);
  }
}

module.exports = { configured, uploadFile, deleteFile, publicBase };
