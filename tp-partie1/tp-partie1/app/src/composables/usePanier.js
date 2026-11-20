import { ref, computed } from 'vue';

// Déclaré EN DEHORS de la fonction : un seul panier pour toute l'application
const lignes = ref([]); // chaque ligne : { plat, quantite }

export function usePanier() {
    function ajouter(plat) {
    // TODO : si le plat est déjà dans le panier, quantite + 1,
    //        sinon ajouter une ligne { plat, quantite: 1 }
    const platt = lignes.value.find(l => l.plat.id === plat.id); 
    platt ? platt.quantite ++ : lignes.value.push({plat,quantite: 1});
    console.log("ajouter");
  }

  function changerQuantite(platId, delta) {
    // TODO : ajoute delta (+1 ou -1) à la quantité ;
    //        si la quantité tombe à 0, retirer la ligne
    const plat = lignes.value.find(l => l.plat.id === platId);
    plat.quantite+= delta ;
    plat.quantite<= 0 ? lignes.value.splice(lignes.value.findIndex(l =>l.plat.id === platId)) : null;

}

  function vider() {
    lignes.value = [];
  }

  const nombreArticles = computed(() => /* TODO : somme des quantités */ 
    lignes.value.reduce((somme,l)=>somme + Number(l.quantite),0)
);
  const total = computed(() => /* TODO : somme des prix × quantités */ 
    lignes.value.reduce((totale,l)=> totale + (Number(l.plat.prix)*l.quantite),0)
);

  return { lignes, ajouter, changerQuantite, vider, nombreArticles, total };
}