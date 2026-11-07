import mongoose, { Document, Schema } from 'mongoose';

export enum OrderStatus {
    PENDING = 'Pending',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
}

export interface IOrderItem {
    recipe: mongoose.Types.ObjectId;
    quantity: number;
    price: number; // Price per unit at the time of order
}

export interface IOrder extends Document {
    customerName: string;
    items: IOrderItem[];
    totalAmount: number;
    status: OrderStatus;
    orderName?: string;
    contactNumber?: string;
    orderDate?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    orderType?: string;
    pickupLocation?: string;
    deliveryAddress?: string;
    flavour?: string;
    sizeWeight?: string;
    shape?: string;
    tiers?: string;
    frostingFilling?: string;
    colorTheme?: string;
    cakePhoto?: string;
    messageOnCake?: string;
    messageOnBoard?: string;
    nameAgeNumber?: string;
    additionalDecorations?: string;
    specialInstructions?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        customerName: {
            type: String,
            required: true,
            trim: true,
        },
        items: [
            {
                recipe: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Recipe',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        orderName: { type: String, trim: true },
        contactNumber: { type: String, trim: true },
        orderDate: { type: String, trim: true },
        deliveryDate: { type: String, trim: true },
        deliveryTime: { type: String, trim: true },
        orderType: { type: String, default: 'Pickup' },
        pickupLocation: { type: String, default: 'Al Mamzar' },
        deliveryAddress: { type: String, trim: true },
        flavour: { type: String, trim: true },
        sizeWeight: { type: String, trim: true },
        shape: { type: String, trim: true },
        tiers: { type: String, trim: true },
        frostingFilling: { type: String, trim: true },
        colorTheme: { type: String, trim: true },
        cakePhoto: { type: String, trim: true },
        messageOnCake: { type: String, trim: true },
        messageOnBoard: { type: String, trim: true },
        nameAgeNumber: { type: String, trim: true },
        additionalDecorations: { type: String, trim: true },
        specialInstructions: { type: String, trim: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
