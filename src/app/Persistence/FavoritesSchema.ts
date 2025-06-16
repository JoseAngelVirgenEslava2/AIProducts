import mongoose, { Schema, Document } from "mongoose";

export interface IProductSubdoc extends Document {
    productId: string;
    name: string;
    price: number;
    currency: string;
    url: string;
    source: string;
    lastChecked: Date;
  }

export interface IFavoriteDoc extends Document {
  userId: mongoose.Types.ObjectId;
  products: IProductSubdoc[];
}

const productSubSchema = new Schema<IProductSubdoc>(
  {
    id: String,
    name: String,
    price: Number,
    currency: String,
    url: String,
    source: String,
    lastChecked: Date,
  },
  { _id: false }
);

const favoriteSchema = new Schema<IFavoriteDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [productSubSchema],
  },
  { timestamps: true }
);

export const FavoriteModel =
  mongoose.models.Favorite ||
  mongoose.model<IFavoriteDoc>("Favorite", favoriteSchema);