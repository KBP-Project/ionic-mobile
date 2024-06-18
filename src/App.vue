<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script>
import { IonApp, loadingController, IonRouterOutlet } from '@ionic/vue';

import db from './firebase/init.js';
import { doc,getDoc,onSnapshot, updateDoc, collection, addDoc } from "firebase/firestore";

export default {
  components: {
    IonApp, IonRouterOutlet, loadingController
  },

  data() {
    return {
      api_path: 'http://localhost:8001/',

      dbfirebase: db,
      docFirebase: doc,
      getDocFirebase: getDoc,
      onSnapshotFirebase: onSnapshot, 
      updateDocFirebase: updateDoc, 
      collectionFirebase: collection,
      addDocFirebase: addDoc,

      id_chat:0,
      flagNotif: false,
      loading: null,
    }
  },
  
  methods: {
    async openLoading(isLoading, message = "Loading ...") {
      if(isLoading == true){
        this.loading = await loadingController.create({
            message: message,
        });
        this.loading.present();
      }
      if(isLoading == false) this.loading.dismiss();
    },
  }
}
</script>
