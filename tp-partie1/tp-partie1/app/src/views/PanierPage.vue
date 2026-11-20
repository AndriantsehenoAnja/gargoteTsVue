<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Panier</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-buttons slot="end" @click="vider()" v-if="nombreArticles>0">
      Vider
    </ion-buttons>
    <ion-button v-if="lignes.length ===0" :router-link="`/tabs/menu`">
      Voir le menu 
    </ion-button>
    <ion-list v-else>
      <ion-item v-for="ligne in lignes">
        <ion-label>
          <p>{{ ligne.plat.nom }}</p>
          <p>{{ ligne.quantite }}</p>
          <p>{{ ligne.plat.prix * ligne.quantite }}</p>
        </ion-label>
        <ion-button @click="changerQuantite(ligne.plat.id,-1)">
          removeCircleOutline
        </ion-button>
        <ion-button @click="changerQuantite(ligne.plat.id,+1)">
          addCircleOutline
        </ion-button>
      </ion-item>
    </ion-list>

    <ion-content class="ion-padding">
      <p class="ion-text-center">
        <ion-text color="medium">Totale : {{total}} ar</ion-text>
      </p>
    </ion-content>
    <ion-input v-model="table" type="number" label="Numéro de table"
              label-placement="floating" fill="outline"
              :class="{ 'ion-invalid ion-touched': erreurTable }"
              :error-text="erreurTable" />
    <ion-button expand="block" class="ion-margin-top" :disabled="envoi" @click="createcommande()">
      Envoyer la commande
    </ion-button>
  </ion-page>
</template>

<script setup>
import { IonPage,IonInput,IonItem,IonLabel,IonButton,IonButtons, IonHeader, IonToolbar, IonTitle,IonList, IonContent, IonText,loadingController, alertController, toastController } from '@ionic/vue';
import api from '@/services/api';
import { ref } from 'vue';
import {usePanier} from '../composables/usePanier'
import { formatAriary } from '@/utils/format';
import { useIonRouter } from '@ionic/vue';

const ionRouter = useIonRouter();
const table = ref('');
const erreurTable = ref('');
const { lignes, ajouter, changerQuantite, vider, nombreArticles, total }=usePanier(); 

async function createcommande() {
  
  const alerte = await alertController.create({
    header: 'Confirmer la commande',
    message: `Table ${table.value} : ${formatAriary(total.value)}`,
    buttons: [
      { text: 'Annuler', role: 'cancel' },
      { text: 'Envoyer', role: 'confirm' },
    ],
  });

  await alerte.present();
  const { role } = await alerte.onDidDismiss();
  role === 'confirm'? await envoyer(table):null;
}

async function envoyer(table) {
  const loading = await loadingController.create({
    message: 'Envoi de la commande...',
    color: 'primary',
  });
  await loading.present();
  const commande = {
    table: table.value,
    lignes: lignes.value.map(ligne => ({
      plat_id: ligne.plat.id,
      quantite: ligne.quantite,
    })),
  };
  console.log(commande.table);
  try {
    await api.creerCommande(commande);
    const toast = await toastController.create({
      header: 'Commande envoyée',
      message: `Table ${table.value} : ${formatAriary(total.value)}`,
      buttons: [{
        text:"OK",role:"ok"
      }],
    });
    await toast.present();
    const {role} = await toast.onDidDismiss();
    if(role==='ok'){
      vider();
      table.value = '';
      ionRouter.navigate('/tabs/commandes', 'forward', 'replace')
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la commande :', error);
    const toast1 =await toastController.create({
        header: 'Erreur',
        message: error.message,
        buttons: [{
          text:"OK",role:"ok"
        }],
        color: 'danger',
      });
    erreurTable.value = error.statut ===422 ? "Numéro de table invalide" : toast1.present();
  } finally {
    await loading.dismiss();
  }
}


</script>
