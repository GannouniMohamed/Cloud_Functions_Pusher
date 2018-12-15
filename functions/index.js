const functions = require('firebase-functions')
const fetch = require('node-fetch')

const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.BRAINSTORMING_Pusher = functions.database.ref('taskList/{taskId}').onCreate((snap, context) => {
  console.log('snap ====>', snap)
  console.log('context ====>', context)
  const root = snap.ref.root
  var messages = []

  return root.child('/Devices').once('value').then((snapshot) => {
    console.log('Devices', snapshot)
    snapshot.forEach((childSnapshot) => {
      const expoPushToken = childSnapshot.val().expoPushToken
      console.log('expoPushToken ====>', expoPushToken)
      messages.push({
        to: expoPushToken,
        sound: 'default',
        body: 'New Note Added',
        title: 'Note global de la societé',
      })
    })
    // firebase.database then() respved a single promise that resolves
    // once all the messages have been resolved
    return Promise.all(messages)
  })
    .then(messages => {
      console.log('fetch messages', JSON.stringify(messages))
      return fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messages)

      })
    })
    .then(res => console.log('finel res', res))
    .catch(reason => {
      console.log('why', reason)
    })
})
