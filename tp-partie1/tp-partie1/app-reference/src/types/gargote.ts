
export interface Categorie {
  id: number;
  nom: string;
}

export interface Plat {
  id: number;
  nom: string;
  description: string;
  /** Montant envoyé par l'API sous forme de chaîne : "6000.00" */
  prix: string;
  categorie_id: number;
  disponible: boolean;
  categorie: Categorie | null;
}

export type StatutCommande = 'en_attente' | 'en_preparation' | 'servie' | 'payee';

export interface LigneCommande{
    plat_id:number;
    nom:string;
    prix_unitaire:string;
    quantite:number;
    sous_total:string;
}

export interface Commande{
    id:number;
    date:string;
    table:number;
    lignes:LigneCommande[];
    total:number;
    statut:StatutCommande;
}

export interface NouvelleCommande{
    table:number;
    lignes:LigneCommande[];
}

export interface LignePanier{
    plat:Plat;
    quantite:number;
}