<template>
  <!-- ion-page : l'enveloppe obligatoire de chaque page -->
  <ion-page>
    <!-- En-tête fixe en haut de l'écran -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>detail plat</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-buttons slot="start">
      <ion-back-button default-href="/tabs/menu" text="Menu" />
    </ion-buttons>
    <ion-card v-if="plat">
      <ion-card-header>
        <ion-card-title>{{ plat.nom }}</ion-card-title>
        <ion-card-subtitle>{{ formatAriary(plat.prix) }}</ion-card-subtitle>
        <ion-card-subtitle>{{plat.categorie }}</ion-card-subtitle>
        <p v-if="riz">Avec du riz : {{ formatAriary(Number(plat.prix)+Number(riz.prix)) }}</p>
      </ion-card-header>
      <ion-card-content>
        {{ plat.description }}
      </ion-card-content>
      <ion-button expand="block" :disabled="!plat.disponible"
          @click="ajouterAuPanier(plat)">
          Ajouter
      </ion-button>
    </ion-card>
    <ion-card v-else-if="erreur">
        <ion-card-header>
            <ion-card-title>Erreur</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-text color="danger">
            {{ erreur }}
        </ion-text>
    </ion-card-content>
</ion-card>

    <!-- Zone qui défile -->
    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>
      
    </ion-content>
    
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import {
  IonPage,IonInput,IonButtons,IonButton,IonBackButton,IonCardHeader,IonCardSubtitle,IonCardContent,IonCardTitle,IonHeader,IonCard, IonToolbar, IonTitle, IonText, IonContent, IonRefresher, IonRefresherContent
} from '@ionic/vue';
import api from '@/services/api';
import {usePanier} from '../composables/usePanier';
import { formatAriary } from '@/utils/format';
import { useRoute } from 'vue-router';
import { useIonRouter } from '@ionic/vue';

const chargement = ref(true);
const erreur = ref(null);
const plat = ref(null);
const route = useRoute();
const idPlat = computed(() => route.params.id);
const ionRouter = useIonRouter();

const riz = ref(null);
// // dans onMounted, après le chargement du plat :


async function rafraichir(event) {
  await charger();
  event.target.complete(); // arrête l'animation
}

async function ajouterAuPanier(plat) {
  await usePanier().ajouter(plat);
  ionRouter.back()
}

async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    plat.value = await api.getPlat(idPlat.value);
    riz.value = await api.getPlat(7);
  } catch (e) {
    erreur.value = e.statut === 404 ? "Ce plat n\'existe pas. " : "Erreur de chargement";
    console.error(e.status);
  } finally {
    chargement.value = false;
  }
}

onMounted(charger);
</script>
