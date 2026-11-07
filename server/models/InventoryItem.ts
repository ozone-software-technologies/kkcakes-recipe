import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
    ingredient: mongoose.Types.ObjectId;
    quantity: number;
    lowStockThreshold: number;
    updatedAt: Date;
}

const InventoryItemSchema: Schema = new Schema(
    {
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredient',
            required: true,
            unique: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: 10,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
