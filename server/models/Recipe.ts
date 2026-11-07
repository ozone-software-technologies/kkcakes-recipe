import mongoose, { Document, Schema } from 'mongoose';

export interface IRecipeIngredient {
    ingredient: mongoose.Types.ObjectId;
    quantity: number;
}

export interface IRecipe extends Document {
    name: string;
    description?: string;
    price: number;
    ingredients: IRecipeIngredient[];
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const RecipeSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        ingredients: [
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
        image: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);
