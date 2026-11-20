<template>
  <!-- ion-page : l'enveloppe obligatoire de chaque page -->
  <ion-page>
    <!-- En-tête fixe en haut de l'écran -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Menu du jour</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-toolbar>
      <ion-searchbar v-model="recherche" placeholder="Rechercher un plat" :debounce="250"/>
    </ion-toolbar>
    <ion-toolbar>
      <ion-segment v-model="categorieChoisie" scrollable @ion-change="charger">
        <ion-segment-button value="toutes"><ion-label>Tout</ion-label></ion-segment-button>
        <ion-segment-button v-for="c in categories" :key="c.id" :value="String(c.id)">
          <ion-label>{{ c.nom }}</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-toolbar>
    
    <!-- Zone qui défile -->
    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
      <ion-refresher-content />
    </ion-refresher>
      <!-- 1. Chargement en cours -->
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <!-- 2. Erreur -->
      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <!-- 3. La liste des plats -->
      <ion-list v-else>
        <ion-item v-for="plat in platsFiltres" :key="plat.id" :router-link="`/tabs/menu/${plat.id}`">
          <ion-label>
            <h2>{{ plat.nom }}</h2>
            <p>{{ plat.description }}</p>
            <p>{{ plat.categorie.nom }}</p>
            <ion-badge v-if="!plat.disponible" color="medium">Épuisé</ion-badge>
          </ion-label>
          <ion-text color="primary"> {{ plat.prix }} Ar</ion-text>
          <!-- <ion-note slot="end">{{ formatAriary(plat.prix) }}</ion-note> -->
          <ion-button slot="end" fill="clear" :disabled="!plat.disponible"
                      @click.stop.prevent="ajouterAuPanier(plat)">
            <ion-icon slot="icon-only" :icon="addCircleOutline" />
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
    
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  IonPage,IonIcon,IonSearchbar, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonRefresher, IonRefresherContent, IonNote, IonSegment,IonSegmentButton,IonSpinner, IonText, IonButton,IonBadge,
  toastController
} from '@ionic/vue';
import api from '@/services/api';
import {usePanier} from '../composables/usePanier';
import { onMounted, onUnmounted } from 'vue';
import { onIonViewWillEnter, onIonViewDidLeave } from '@ionic/vue';
import { addCircleOutline } from 'ionicons/icons';

onMounted(() => console.log('MENU onMounted'));
onUnmounted(() => console.log('MENU onUnmounted'));
onIonViewWillEnter(() => console.log('MENU ionViewWillEnter'));
onIonViewDidLeave(() => console.log('MENU ionViewDidLeave'));


const plats = ref([]);
const categories = ref([]);
const chargement = ref(true);
const erreur = ref(null);
const recherche = ref('');
const categorieChoisie = ref('toutes');


async function ajouterAuPanier(plat) {
  await usePanier().ajouter(plat);
  const toast = await toastController.create({
    message: `${plat.nom} ajouté au panier`,
    duration: 1500, position: 'top', color: 'secondary',
  });
  await toast.present();
}

const platsFiltres = computed(() => {
  const termeRecherche = recherche.value.toLowerCase().trim();
  const idCat = categorieChoisie.value ?? 'toutes';

  return plats.value.filter(plat => {
    const correspondRecherche = 
      plat.nom.toLowerCase().includes(termeRecherche) ||
      (plat.description && plat.description.toLowerCase().includes(termeRecherche));

    const correspondCategorie = 
      idCat === 'toutes' || String(plat.categorie?.id) === String(idCat);

    return correspondRecherche && correspondCategorie;
  });
});
async function rafraichir(event) {
  await charger();
  event.target.complete(); // arrête l'animation
}
async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    plats.value = await api.getPlats();
    categories.value = await api.getCategories();
  } catch (e) {
    erreur.value = "Impossible de joindre l'API. Est-elle lancée ?";
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

onMounted(charger);
</script>
