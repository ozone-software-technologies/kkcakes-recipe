import mongoose, { Document, Schema } from 'mongoose';

export enum TransactionType {
    RECEIVE = 'RECEIVE',
    ADJUSTMENT = 'ADJUSTMENT',
    USAGE = 'USAGE',
    PRODUCTION = 'PRODUCTION'
}

export interface IStockTransaction extends Document {
    ingredient: mongoose.Types.ObjectId;
    type: TransactionType;
    quantity: number;
    invoiceNumber?: string;
    purchaseOrder?: string;
    date: Date;
    userId?: string; // Optional for now until we fully track user actions
}

const StockTransactionSchema: Schema = new Schema(
    {
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredient',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        invoiceNumber: {
            type: String,
        },
        purchaseOrder: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        userId: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IStockTransaction>('StockTransaction', StockTransactionSchema);
