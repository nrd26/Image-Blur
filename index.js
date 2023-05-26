const express = require('express'); 
const app = express();              
const port = 5000;                  
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
// const writeFile = promisify(fs.writeFile);

async function blurImagesInFolder(folderReadPath, folderWritePath) {
  try {
    // Read all image files from the folder
    const files = await readdir(folderReadPath);

    // Filter out non-image files
    const imageFiles = files.filter(file =>
      ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase())
    );

    // Limit the number of images to process
    const numImagesToProcess = Math.min(imageFiles.length, 10);

    var blurredImagePathArray = []
      // Create an array of promises for parallel processing
    const promises = imageFiles
    .slice(0, numImagesToProcess)
    .map(async imageFile => {
        
      const imagePath = path.join(folderReadPath, imageFile);
      console.log("Blurring image")
      
      const image = await Jimp.read(imagePath);
      
      // Apply the blur effect
      console.time(imagePath)
      await image.blur(30);           
      console.timeEnd(imagePath)
      // Save the blurred image with the same filename
      const blurredImagePath = path.join(folderWritePath, `blurred_${imageFile}`);
      await image.writeAsync(blurredImagePath);
      
      console.log("Image blurred")
      blurredImagePathArray.push(blurredImagePath)
      return blurredImagePath;
    });
     // Wait for all promises to complete
    const blurredImagePaths = await Promise.allSettled(promises);

    console.log('Image blurring complete.');
    console.log('Blurred images:', blurredImagePaths);
    return blurredImagePathArray;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Specify the folder path containing the images
const folderReadPath = 'images';
const folderWritePath = 'blurred-images'

// Call the function to blur images in the folder

app.get('/', async (req, res) => {      
    const blurredImagePaths = await blurImagesInFolder(folderReadPath, folderWritePath);  
    res.status(200).send(`Images blurred: ${blurredImagePaths}`);                                                            
});

app.listen(port, () => {            
    console.log(`Now listening on port ${port}`);
    
});