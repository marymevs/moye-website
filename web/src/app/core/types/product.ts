/**
 * Firestore doc shape for the `products` collection.
 */
export interface ProductRecord {
  id: string;
  title: string;
  shortBio: string;
  longBio: string;
  priceCents: number;
  coverPath: string;
  stock: number;
  order: number;
}

/**
 * Runtime shape consumed by UI components. Same fields as
 * `ProductRecord` but with `coverPath` resolved to a public
 * download URL via Firebase Storage.
 */
export interface Product {
  id: string;
  title: string;
  shortBio: string;
  longBio: string;
  priceCents: number;
  coverUrl: string;
  stock: number;
}
