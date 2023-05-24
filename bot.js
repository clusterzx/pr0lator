const { Pr0grammAPI, NodeRequester, Pr0grammCommentsService, ItemFlags } = require("pr0gramm-api");
const https = require('https');
const { PythonShell } = require('python-shell');
const fs = require('fs');
const axios = require('axios');
const {default: PQueue} = require('p-queue');
const dbHandler = require('./dbHandler.js');

const requester = NodeRequester.create();
const api = Pr0grammAPI.create(requester);

const hostname = "http://yourhostname.com"

function fetchDataFromAPI() {
    return new Promise(async (resolve) => {
        var data = [];
        const loginResponse = await api.user.login("YOURBOTNAME", "YOURBOTPASSWORD");
        const getComments = await api.messages.getComments();     
        data = getComments.messages;
        resolve(data);
  });
}

// Main function to fetch data and process it sequentially
async function fetchDataAndProcess() {
  const fetchedData = await fetchDataFromAPI();
  console.log(`Fetched ${fetchedData.length} items`);

  // Create a queue with concurrency of 1 (to process sequentially)
  const queue = new PQueue({ concurrency: 1 });

  // Process each fetched data item
  fetchedData.forEach((item) => {
    //if item.read == 0 add to queue
    if(item.read == 0){
        queue.add(() => processItem(item));
    }else{
        //Nothing to see here
    }
  });

  // Wait for all items to be processed
  await queue.onIdle();

  console.log('All items processed');
  //add timeout to prevent api spam (every 1.5 minutes)
  setTimeout(fetchDataAndProcess, 90000);  
}

// Function to process an item (can be customized)
async function processItem(item) {
  var newThumb = item.thumb.replace(".jpg", ".mp4");
  var mediaUrl = "https://videos.pr0gramm.com/" + newThumb;
  //check if postId is already in database
  var checkPostId = await dbHandler.checkIfPostIdExists(item.itemId).then(async (result) => {
    if(result == true){
        return(false);
    } else {
      var checkVideo = await checkVideoSource(item.thumb).then(async (result) => {
        if(result == true){
            console.log("[TRANSLATING STARTED]");
            var translation = await translateVideo(item.id, item.itemId, item.name, mediaUrl);        
            if (translation) {
              //add to database.db if translation was successful
              await dbHandler.saveToDatabase(item.id, item.itemId, item.name, mediaUrl).then((result) => {
                console.log("Added to database");
              });
              console.log("[TRANSLATING DONE]");
            } else {
              console.log("Video translation failed");
            }
            console.log(`Processing item: ${JSON.stringify(item)}`);
          } else {
            console.log(`Item not processed: ${JSON.stringify(item)}`);
          }
      });
    }
  });
}

//function check video source
async function checkVideoSource(thumb){
    return new Promise(async (resolve) => {
      var newThumb = thumb.replace(".jpg", ".mp4");
      var mediaUrl = "https://videos.pr0gramm.com/" + newThumb;
      const url = mediaUrl;
      var statusCode;
      statusCode = await getStatusCode(mediaUrl);
      if(statusCode == 200) {
          axios.head(url)
          .then(async function (response) {
              // handle success
              console.log("File size: " + response.headers['content-length'] + " bytes");
              if(response.headers['content-length'] > 500000){
                  console.log("File size is bigger than 0.5mb, downloading...");
                  resolve(true);
              }else if(response.headers['content-length'] == undefined){
                  console.log("File is not a video, skipping...");
                  resolve(false);
              }else{
                  console.log("File size is smaller than 1mb, not downloading...");
                  resolve(false);
              }
          }
          )
          .catch(function (error) {
              // handle error
              console.log(error);
          })
      }else{
          console.log("File not found, skipping...");
          return false;
      }
    });
}

async function getStatusCode(url){
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(res.statusCode);
        });
    });
}

//function translate video
async function translateVideo(commentId, postId, commentAuthor, mediaUrl){
  // create promise to translate video
  return new Promise((resolve) => {
    const options = {
      mode: 'text',
      pythonPath: 'python3', // Path to the Python interpreter (optional)
      pythonOptions: ['-u'], // get print results in real-time
      args: [mediaUrl, "video", "en"] // An argument which can be accessed in the script using sys.argv[1
    };
    var outputFile;
    PythonShell.run('convert.py', options).then(messages=>{
      // get results
      console.log(messages);
      const detectedLang = messages[0];
      const outputSanitzedMessage = messages[1].slice(6);
      console.log(outputSanitzedMessage);
      outputFile = hostname + "/watch/" + outputSanitzedMessage;  
      const answerComment = api.comments.post(postId, "Hallo " + commentAuthor + ",\nhier ist dein konvertiertes Video: \n\n" + outputFile + "\n" + detectedLang + "\n\n Es diente dir pr0lator.", commentId);
      resolve(true);
    });
  });
}

fetchDataAndProcess();