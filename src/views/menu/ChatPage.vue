<template>
<ion-page>
    <ion-content :fullscreen="true" class="ion-padding-bottom">

        <div class="container bg-primary py-2" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <div style="padding-right: 15px;">
                    <ion-icon style="font-size: 3rem; color: white; vertical-align: middle;" :icon="arrowBackCircle" @click="back" />
                </div>
                <div style="display: flex; align-items: center;">
                    <ion-icon style="font-size: 3rem; color: white; vertical-align: middle;" :icon="personCircleSharp"></ion-icon>
                    <p style="color: white; margin: 0 0 0 5px; vertical-align: middle;">AGNES</p>
                </div>
            </div>
        </div>

        <div class="input-group">
            <template v-for="(value, key, index) in chat" :key="key">
                <div :class="value.tipe == 'web' ? 'message received' : 'message sent'">
                    <p>{{ value.chat }}</p>
                </div>
            </template>
        </div>

    </ion-content>

    <div class="input-container">
        <ion-input v-model="value_inputChat" placeholder="Masukkan Pesan" fill="outline" class="input-message"></ion-input>
        <ion-button class="send-button" @click="storeDataFirestore()">
            <ion-icon :icon="sendOutline"></ion-icon>
        </ion-button>
    </div>
</ion-page>
</template>

    
<script>
import {
    IonPage,
    IonContent,
    IonIcon,
    IonInput,
    IonButton,
    useIonRouter,
} from '@ionic/vue';
import {
    arrowBackCircle,
    personCircleSharp,
    sendOutline
} from 'ionicons/icons';

export default {
    components: {
        IonPage,
        IonContent,
        IonIcon,
        IonInput,
        IonButton,
    },
    setup() {
        return {
            arrowBackCircle,
            personCircleSharp,
            sendOutline,
            temp_docChat: {
                id: 'paklaring'
            },
            value_inputChat: null
        };
    },
    data() {
        return {
            chat: [],
            fullname: localStorage.getItem('nama'),
        }
    },
    created() {
        this.getDataFromFirebase();
    },
    methods: {
        storeDataFirestore: async function () {
            try {
                this.$root.isLoading = true;
                this.$root.updateDocFirebase(this.$root.docFirebase(this.$root.dbfirebase, 'allchats', 'chat'), {
                    "nama": this.fullname,
                    "chat": this.value_inputChat,
                    "time": new Date(),
                    "tipe": 'android'
                });

                const chat = {
                    nama: this.fullname,
                    chat: this.value_inputChat,
                    time: new Date(),
                    tipe: 'android'
                }

                this.chat.push(chat);
                this.value_inputChat = '';
            } catch (e) {
                console.log(e);
            }
            this.$root.isLoading = false;
        },
        getDataFromFirebase: async function () {
            try {
                this.$root.onSnapshotFirebase(this.$root.docFirebase(this.$root.dbfirebase, "allchats", "chat"), (snap) => {
                    if (this.$root.flagNotif == false) {
                        this.$root.flagNotif = true;
                        return;
                    }
                    if (snap.data().tipe == 'web') {
                        this.chat.push(snap.data());
                    }
                });
            } catch (e) {
                console.log(e);
            }
        },
        back: function () {
            this.$router.back();
        }
    },
}
</script>

    
<style scoped>
.ion-padding-bottom {
    padding-bottom: 80px;
}

.input-group {
    padding: 10px 10px 80px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: calc(100vh - 160px);
    /* Adjust the height to make sure the input-group fills the remaining space */
}

.message {
    position: relative;
    margin: 10px 0;
    padding: 10px;
    max-width: 75%;
    word-wrap: break-word;
    display: inline-block;
}

.message.received {
    background-color: hsl(0, 0%, 87%);
    align-self: flex-start;
}

.message.received::before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-right: 15px solid hsl(0, 0%, 87%);
    border-bottom: 10px solid transparent;
    left: -15px;
    top: 10px;
}

.message.sent {
    background-color: #ffffff;
    align-self: flex-end;
    text-align: right;
}

.message.sent::before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-left: 15px solid #ffffff;
    border-bottom: 10px solid transparent;
    right: -15px;
    top: 10px;
}

.input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    padding: 10px;
    display: flex;
    align-items: center;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.input-message {
    flex: 1;
    margin-right: 10px;
}

.send-button {
    --padding-start: 0;
    --padding-end: 0;
    --padding-top: 0;
    --padding-bottom: 0;
    height: 100%;
    width: 15%;
}
</style>
