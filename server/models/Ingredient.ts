import mongoose, { Document, Schema } from 'mongoose';

export enum IngredientType {
    PROCESSED = 'Processed',
    RAW = 'Raw',
}

export enum UnitType {
    GRAMS = 'Grams',
    PIECES = 'Pieces',
    LITERS = 'Liters',
}

export interface IIngredient extends Document {
    name: string;
    type: IngredientType;
    unit: UnitType;
    components?: { ingredient: mongoose.Types.ObjectId; quantity: number }[];
    isDeleted?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const IngredientSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: Object.values(IngredientType),
            required: true,
        },
        unit: {
            type: String,
            enum: Object.values(UnitType),
            required: true,
        },
        components: [
            {
                ingredient: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Ingredient',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IIngredient>('Ingredient', IngredientSchema);
