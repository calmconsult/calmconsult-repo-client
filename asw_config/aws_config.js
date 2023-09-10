const AWS  = require('aws-sdk'),
 { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");




const s3 = new AWS.S3({
    accessKeyId: process.env.AmazonS3_Access_Key_ID,
    secretAccessKey: process.env.AmazonS3_Secret_Access_Key,
    region: process.env.AmazonS3_Region,
  })


  const S3 = new S3Client({
    credentials:{
      accessKeyId: process.env.AmazonS3_Access_Key_ID,
      secretAccessKey: process.env.AmazonS3_Secret_Access_Key,
    },
    region: process.env.AmazonS3_Region,
})

//   module.exports.getVideo = (key) => {
//     const params = {
//       Bucket: `${process.env.AmazonS3_Bucket_Name}/videos`,
//       Key: key,
//     }
//     return s3.getObject(params).createReadStream()
//   };



  module.exports.s3 = s3;
  module.exports.S3 = S3;
  module.exports.GetObjectCommand = GetObjectCommand;