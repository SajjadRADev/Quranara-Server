import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ICategory } from "./Category";

export interface ITv {
    title: string;
    description: string;
    publisher: PopulatedDoc<Document<ObjectId> & IUser>;
    category: PopulatedDoc<Document<ObjectId> & ICategory>;
    cover: string;
    video: string;
    attached: string;
    content: string;
    views: number;
}

const schema = new Schema<ITv>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        publisher: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        cover: {
            type: String,
            required: true,
        },

        video: {
            type: String,
            required: true,
        },

        attached: String,

        content: String,

        views: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const TvModel = model<ITv>("Tv", schema);

export default TvModel;
