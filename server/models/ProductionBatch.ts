import mongoose, { Document, Schema } from 'mongoose';

export enum ProductionStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface IProductionBatch extends Document {
    ingredient: mongoose.Types.ObjectId;
    quantity: number;
    status: ProductionStatus;
    startDate: Date;
    completedDate?: Date;
    userId?: string;
    actionByEmail?: string;
    invoiceNumber: string;
}

const ProductionBatchSchema: Schema = new Schema(
    {
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredient',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ProductionStatus),
            default: ProductionStatus.IN_PROGRESS,
            required: true,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        completedDate: {
            type: Date,
        },
        userId: {
            type: String,
        },
        actionByEmail: {
            type: String,
        },
        invoiceNumber: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IProductionBatch>('ProductionBatch', ProductionBatchSchema);
