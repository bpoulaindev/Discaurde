require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const cloudinaryCfg = {
  "cloud_name": process.env.CLOUD_NAME,
  "api_key": process.env.API_KEY,
  "api_secret": process.env.API_SECRET
}
module.exports = {
  uploadFile: async function(filePath, fileName, fileType, folderName) {
    console.log(filePath, fileName, fileType, folderName);
    cloudinary.config(cloudinaryCfg);
    cloudinary.uploader.upload(filePath, {
    resource_type: "image",
    public_id: `userStorage/${folderName}/${fileName}`,
    overwrite: true },
    function(error, result) {console.log(result, error)});
  },
  listFiles: async function(folderName) {
    cloudinary.config(cloudinaryCfg);
    return await cloudinary.api.resources(
      { type: 'upload', 
        prefix: `userStorage/${folderName}/` });
  },
  deleteFile: async function(folderName, fileName) {
    cloudinary.config(cloudinaryCfg);
    console.log(`userStorage/${folderName}/${fileName}`);
    await cloudinary.uploader.destroy(`userStorage/${folderName}/${fileName}`, {invalidate: true}, function(error,result) {
      console.log(result, "---------", error);
      return(result);
    });
  },
  getFiles: async function(folderName, fileArray) {
    cloudinary.config(cloudinaryCfg);
    for (let i = 0 ; i < fileArray.length ; i+=1) {
      fileArray[i] = `userStorage/${folderName}/${fileArray[i]}`;
    }
    console.log(fileArray);
    const results = cloudinary.api.resources_by_ids(fileArray, function(error, result) {
      if(error) {return error}
    });
    return results;
  },
  deleteFolder: async function(folderName) {
    cloudinary.config(cloudinaryCfg);
    await cloudinary.api.delete_resources_by_prefix(`userStorage/${folderName}/`, 
      function(error, result) {
        cloudinary.api.delete_folder(`userStorage/${folderName}`, function(error2, result2){console.log(error2, result2);});;
    });
  },
  getDownloadUrl: async function(fileId) {
    cloudinary.config(cloudinaryCfg);
    console.log(fileId);
    return cloudinary.utils.download_zip_url({public_ids: fileId});
  }
} 