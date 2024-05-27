<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';

import db from './firebase/init.js';
import { doc,getDoc,onSnapshot, updateDoc, collection, addDoc } from "firebase/firestore";

export default {
  components: {
    IonApp, IonRouterOutlet
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

    }
  },
  
  methods: {

  }
}
</script>
