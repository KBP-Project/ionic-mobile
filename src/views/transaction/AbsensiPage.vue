<template>
    <ion-page>
        <ion-content :fullscreen="true">

            <div id="selfie-container">
                <!-- <img src="@/assets/img/selfie.png" class="image-selfie" alt="selfie image" /> -->
                <div class="tx-left">
                    <ion-icon :icon="arrowBackCircle" @click="back" />
                </div>
            </div>

            <div id="dashboard-container">
                <div v-if="selfie != null" class="foto-selfie">
                    <img :src="selfie" alt="Foto Selfie" />
                </div>

                <div class="btn-selfie" @click.prevent="takePic" v-if="akses_kamera == true">
                    <label>Ambil gambar</label>
                    <img src="@/assets/img/cam.png" alt="Camera" />
                </div>

                <div class="locate-container">
                    <label for="">Lokasi saat ini</label>
                    <div v-if="locate == null" class="locate-content tx-center">
                        Pastikan GPS Anda aktif
                    </div>
                    <div v-else class="locate-content">
                        {{ locate }}
                    </div>
                </div>

                <div class="form">
                    <label>Jarak dari Perusahaan</label>
                    <IonInput type="text" v-model="jarak" full readonly />
                </div>

                <div class="form">
                    <label>Jadwal</label>
                    <IonInput type="text" v-model="jadwal" full readonly />
                </div>

                <div class="form" v-if="terlambat == 1">
                    <label>Alasan datang terlambat</label>
                    <IonTextarea v-model="keterangan" full />
                </div>

                <div class="tx-center">
                    <IonButton v-if="selfie != null && locate != null && workhour_code != null" type="button"
                        @click="absen">Hadir</IonButton>
                </div>
            </div>

        </ion-content>
    </ion-page>
</template>

<script>
// import systems
import { IonContent, IonPage, toastController, loadingController, IonIcon, IonAlert } from '@ionic/vue';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import axios from 'axios';
import { arrowBackCircle } from 'ionicons/icons'


// import components
import IonTextarea from "@/components/form/FormTextarea.vue";
// import IonSelect from "@/components/form/FormSelect.vue";
import IonInput from "@/components/form/FormInput.vue";
import IonButton from "@/components/form/FormButton.vue";

const dt = new Date();
const date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
const time = dt.getHours().toString() + dt.getMinutes().toString();

export default {
    props: [],
    components: { IonContent, IonPage, IonButton, IonIcon, IonAlert, IonTextarea, IonInput },
    data() {
        return {
            filename: localStorage.getItem('id') + "_IN_" + date + "_" + time + '.jpg',
            selfie: null,
            locate: null,
            coordinates: null,
            workhour_code: null,
            schedule_in: null,
            terlambat: null,
            keterangan: null,
            absenceId: null,
            akses_kamera: false,
            jadwal: null,
            jarak: null,
            site_lat: null,
            site_long: null,
            max_range: null,
            accept_distance: false,
        };
    },
    setup() {
        // gps setup
        const printCurrentPosition = async () => {
            const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 1000 });
            return coordinates;
        };


        // camera setup
        (async () => {
            Camera.checkPermissions().then(async (r) => {
                // const toast = await toastController.create({
                //     message: r.camera,
                //     duration: 3000,
                //     position: 'top'
                // });
                // await toast.present();
                if (r.camera == 'denied') {
                    Camera.requestPermissions();
                }
            }).catch(async (e) => {
                const toast = await toastController.create({
                    // message: 'Hidupkan Location pada device anda.',
                    message: e,
                    duration: 3000,
                    position: 'top'
                });
                await toast.present();
            });
        })();

        const takePicture = async () => {
            return await Camera.getPhoto({
                quality: 90,
                width: 1080,
                height: 1920,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                direction: 'FRONT',
                source: 'CAMERA'
            });
        }

        return { takePicture, printCurrentPosition, arrowBackCircle };
    },
    async mounted() {
        this.getJadwal();
        this.getSite();

        const loading = await loadingController
            .create({
                message: 'Mencari lokasi...',
                spinner: 'circles',
            });
        loading.present();

        // gps get coordinates
        this.coordinates = await this.printCurrentPosition();

        let ltlg = null,
            i = 0;
        const intv = setInterval(async () => {

            this.coordinates = await this.printCurrentPosition();
            console.log(this.coordinates.coords.accuracy)

            if (this.coordinates != null) {

                ltlg = this.coordinates.coords.latitude + "," + this.coordinates.coords.longitude;

                if (this.coordinates.coords.accuracy <= 3000) {
                    // get data from open maps
                    (async () => {
                        // const uri = 'https://nominatim.openstreetmap.org/search?q=' + ltlg + '&format=json&polygon_geojson=1&addressdetails=1';
                        const uri = 'https://nominatim.openstreetmap.org/search?q=-5.49358425871698, 120.3891205302669&format=json&polygon_geojson=1&addressdetails=1';

                        this.locate = await axios.get(uri).then(async (r) => {
                            if (r.status == 200) {
                                // const toast = await toastController.create({
                                //     message: 'Berhasil mengambil informasi lokasi',
                                //     duration: 3000,
                                //     position: 'top'
                                // });
                                // await toast.present();
                                loading.dismiss();
                                this.getDistance();

                                console.log(r)

                                if (r.data[0].address.city != null) {
                                    console.log(r.data[0].address.city)
                                } else if (r.data[0].address.county != null) {
                                    console.log(r.data[0].address.county)
                                } else {
                                    console.log(r.data[0].address.city_district)
                                }

                                return r.data[0].display_name;
                            } else {
                                const toast = await toastController.create({
                                    message: 'Gagal mengambil informasi lokasi',
                                    duration: 3000,
                                    position: 'top'
                                });
                                await toast.present();
                                return;
                            }
                        });
                    })()

                    clearInterval(intv);
                }
            }
            i++;

            if (i > 19) {
                clearInterval(intv);

                const toast = await toastController.create({
                    message: 'Gagal mengambil informasi lokasi',
                    duration: 3000,
                    position: 'top'
                });
                await toast.present();
                loading.dismiss();

                setTimeout(this.$router.go(-1), 3000);
            }
        }, 3000);

    },

    methods: {
        getSite() {
            return axios.get(this.$root.api_path + 'mst/masterDepartemen/getByDepartemenCode/' + localStorage.getItem('departemen_code'))
                .then(async (response) => {
                    const data = response.data.data;
                    // binding data
                    this.site_lat = data.latitude;
                    this.site_long = data.longitude;
                    this.max_range = data.max_range;

                }).catch(async (e) => {
                    const err = e.response.data.message;
                    const toast = await toastController.create({
                        message: err,
                        duration: 5000,
                        position: 'top'
                    });
                    await toast.present();
                });
        },
        getDistance() {
            //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
            // lat long 1 for user coordinates, lat long 2 for site coordinates
            // const lati1 = -6.194694432975138;
            // const lon1 = 106.90885202793201;
            // const lati2 = -6.194695133182354;
            // const lon2 = 106.90882991656316;
            const lati1 = this.coordinates.coords.latitude;
            const lon1 = this.coordinates.coords.longitude;
            const lati2 = this.site_lat;
            const lon2 = this.site_long;
            function calcCrow() {
                const R = 6371000; // meter
                // const R = 6371; // km
                const lat1 = toRad(lati1);
                const lat2 = toRad(lati2);
                const dLat = toRad(lat2 - lat1);
                const dLon = toRad(lon2 - lon1);

                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c;
                return d;
            }

            // Converts numeric degrees to radians
            function toRad(Value) {
                return Value * Math.PI / 180;
            }
            this.jarak = calcCrow().toFixed(2)

            if (this.jarak <= this.max_range) {
                this.jarak = this.jarak + ' | Jarak sesuai'
                this.accept_distance = true;
            } else {
                // console.log(this.max_range)
                this.jarak = this.jarak + ' | Jarak terlalu jauh'
                this.accept_distance = false;
            }
            // console.log(lati1 + ',' + lon1)
            // console.log(lati2 + ',' + lon2)
            // console.log(this.jarak)
            // console.log(this.max_range)
        },

        getJadwal() {
            const dt = new Date();

            const now = dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + dt.getDate();
            const hoursNow = ('0' + (dt.getHours())).slice(-2) + ':' + dt.getMinutes() + ':' + dt.getSeconds();
            // const hoursMax = ('0' + (dt.getHours() + 1)).slice(-2) + ':' + dt.getMinutes() + ':' + dt.getSeconds();

            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const d = new Date();

            const post = {
                users_id: localStorage.getItem('id'),
                now: now,
                day: weekday[d.getDay()]
            }

            return axios.post(this.$root.api_path + 'trx/schedule/getScheduleByUserId', post)
                .then(async (response) => {
                    // binding data
                    const data = response.data.data;
                    this.workhour_code = data.schedule_code;
                    this.schedule_in = data.schedule_in;
                    this.jadwal = data.schedule_name + ', ' + data.schedule_in + ' - ' + data.schedule_out;
                    this.akses_kamera = true;

                    const thisHours = data.schedule_in.slice(1, 2)
                    const hoursMax = ("0" + (parseInt(thisHours) + 2)).slice(-2) + ":" + data.schedule_in.slice(3, 8);

                    if (hoursNow > hoursMax) {
                        const toast = await toastController.create({
                            message: 'Anda terlambat lebih dari 2 jam, silakan ajukan cuti',
                            duration: 5000,
                            position: 'top'
                        });
                        await toast.present();
                        setTimeout(async () => {
                            this.$router.replace('/absensi/cuti');
                        }, 3000);
                    } else if (hoursNow > this.schedule_in) {
                        this.terlambat = 1
                        const toast = await toastController.create({
                            message: 'Anda datang terlambat',
                            duration: 5000,
                            position: 'top'
                        });
                        await toast.present();
                    }
                }).catch(async (e) => {
                    const err = e.response.data.message;
                    const toast = await toastController.create({
                        message: err,
                        duration: 5000,
                        position: 'top'
                    });
                    await toast.present();
                    this.jadwal = 'Tidak ditemukan, silakan hubungi admin'
                });
        },
        routeTo: async function (e, url) {
            this.$router.push(url);
        },
        takePic: async function () {
            const pict = await this.takePicture();
            this.selfie = pict.webPath;

            // create loading overlay
            const loading = await loadingController
                .create({
                    message: 'Please wait...',
                    spinner: 'circles',
                });
            const nameFile = this.filename;

            // convert blob to base64 and save image
            axios.get(this.selfie, { responseType: "blob" })
                .then(async function (response) {
                    await loading.present();
                    const reader = new FileReader();
                    reader.readAsDataURL(response.data);
                    reader.onloadend = function () {
                        const base64data = reader.result;
                        // const formData = new FormData();

                        const splitting = base64data.split(";");
                        const post = {
                            // splitting blob to get base64
                            img: splitting[1].substr(7),
                            name: nameFile,
                        }

                        axios.post(this.$root.api_path + 'trx/attendee/upload', post)
                            .then((res) => {
                                loading.dismiss();
                            })
                            .catch((err) => {
                                loading.dismiss();
                            });
                    };
                });
        },
        absen: async function () {
            const loading = await loadingController
                .create({
                    spinner: 'circles',
                    message: 'Please wait...'
                });
            await loading.present();

            const dt = new Date();
            const date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
            const time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const d = new Date();

            if (this.terlambat == 1) {
                const izin = {
                    day: weekday[d.getDay()],
                    absence_code: 'MTA003',
                    absence_description: this.keterangan,
                    absence_attachment: '',
                    absence_date: date,
                    absence_latitude: this.coordinates.coords.latitude,
                    absence_longitude: this.coordinates.coords.longitude,
                    absence_duration: 0,
                    approval_1: 0,
                    approval_2: 0,
                    users_id: localStorage.getItem('id'),
                    created_by: localStorage.getItem('id')
                }

                await axios.post(this.$root.api_path + 'trx/absence/add', izin)
                    .then((r) => {
                        this.absenceId = r.data.data;
                    }).catch(async (e) => {
                        const err = e.response.data;
                        loading.dismiss()
                        const toast = await toastController.create({
                            message: err.message,
                            duration: 3000,
                            position: 'top'
                        });
                        await toast.present();
                    });
            }

            const imgName = this.filename;
            const post = {
                day: weekday[d.getDay()],
                attendee_date: date,
                attendee_time_in: time,
                attendee_latitude_in: this.coordinates.coords.latitude,
                attendee_longitude_in: this.coordinates.coords.longitude,
                images_in: imgName,
                workhour_code: this.workhour_code,
                absence_ref: this.absenceId,
                absence_ref_desc: this.keterangan,
                // accept_distance: this.accept_distance,
                users_id: localStorage.getItem('id'),
                created_by: localStorage.getItem('id')
            }

            await axios.post(this.$root.api_path + 'trx/attendee/add', post)
                .then(async (r) => {
                    if (r.status) {
                        const toast = await toastController.create({
                            message: 'Anda berhasil absen masuk',
                            duration: 3000,
                            position: 'top'
                        });

                        loading.dismiss()
                        await toast.present();
                        setTimeout(async () => {
                            window.location.replace('/dashboard');
                        }, 100);
                    }
                }).catch(async (e) => {
                    const err = e.response.data;
                    loading.dismiss()
                    const toast = await toastController.create({
                        message: err.message,
                        duration: 3000,
                        position: 'top'
                    });
                    await toast.present();
                });
        },
        back: function () {
            this.$router.back();
        }
    }
}
</script>

<style scoped>
#selfie-container {
    position: absolute;
    height: calc(240px + 2em);
    top: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    z-index: -1;
    text-align: center;
}

#selfie-container ion-icon {
    margin: 10px 10px;
    font-size: 3em;
    color: grey;
    transition: .2s ease-in;
}

#selfie-container ion-icon:hover {
    color: black;
}

#selfie-container .image-selfie {
    width: 60%;
    height: auto;
}

.foto-selfie {
    margin-bottom: 3em !important;
    overflow: hidden;
    text-align: center;
}

.foto-selfie img {
    width: 80%;
    border-radius: 1em;
}

#dashboard-container {
    background: white;
    height: calc(100% + 2em);
    margin-top: 100px;
    border-radius: 2em 2em 0 0;
    padding: 3em 1em 1em 1em;
    box-shadow: 0 -0.2em 1em grey;
    color: black;
    overflow: auto;
}

#dashboard-container .form {
    margin: 50px 0;
    position: relative;
}

#dashboard-container .form>label {
    position: absolute;
    font-size: 12px;
    color: var(--ion-color-step-300);
    background: white;
    top: -9px;
    left: 24px;
    padding: 0 1em;
    z-index: 10;
}

#dashboard-container>* {
    margin: 1em 0;
}

#dashboard-container .btn-selfie {
    width: 100px;
    height: 100px;
    margin: 0 auto;
    position: relative;
    text-align: center;
    cursor: pointer;
}

#dashboard-container .btn-selfie label {
    position: absolute;
    top: -30px;
    left: -50px;
    right: -50px;
    width: 200px;
    font-size: 14px;
}

#dashboard-container .locate-container {
    padding-top: 3em;
    position: relative;
}

#dashboard-container .locate-container>label {
    font-size: 16px;
    position: absolute;
    top: 0;
    left: 0;
    border: 1px solid #cecece;
    border-radius: 1em;
    padding: 0.2em 0.5em;
}

#dashboard-container .locate-container .locate-content {
    margin-top: -1em;
    border: 1px solid #cecece;
    padding: 0.5em;
    border-radius: 0.5em;
}
</style>
