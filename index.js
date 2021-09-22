// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const {dialogflow} = require('actions-on-google');
const app = dialogflow({debug: true});
/*
//experimenting
const Default_Welcome_Intent = "Default_Welcome_Intent";

const welcome = (conv) => {
  conv.ask("Dude this is working");
};

app.intent(Default_Welcome_Intent, welcome);

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
*/

/*
//save home station permanently
app.intent('user_sets_home__2', (conv) => {
  //conv.close(JSON.stringify(conv.user));
  conv.user.storage.home = conv.data.home;
  conv.close(`Kk, I should be saving your home station.`);
});

app.intent('what_is_my_home_intent', (conv) => {
  conv.close(JSON.stringify(conv.user));
});
*/

//exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
//saves home station to firebase
  function setHomeHandler(agent) {
    let home = agent.parameters.home;
    db.collection('homes').add({ home: home});
    agent.add(`Thanks, your home station will be set as ${home}, would you like to set your frequently traveled routes too?`);
  }

//reads home station from firebase
  /*
  function readHomeHandler(agent){
    return admin.database().ref('data').once('value').then((snapshot) => {
    const value = snapshot.child('home').val();
      if(value!==null){
      agent.add('The value form database is ' + value);
      }
    });
   */
    
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  /*
  // store home station
  app.intent('Store Home Station', (conv) => {
    if (conv.user.verification === 'VERIFIED'){
      conv.user.storage.home = conv.data.home;
      conv.close(`Your home station is saved as ${conv.data.home}, is this correct?`);
    } else {
      conv.close(`I can't save it right now because you are not a verified user, please verify or directly state your destination station.`);
    }
  });
  */
  
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('user_sets_home__2', setHomeHandler);
  //intentMap.set('what_is_my_home', readHomeHandler);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});

