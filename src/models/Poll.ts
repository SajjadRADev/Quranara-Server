import { Schema, model } from "mongoose";
import { REFERENCES } from "@/constants/poll";

export type Ref = (typeof REFERENCES)[keyof typeof REFERENCES];

export interface IPoll {
    identifier: string;
    title: string;
    description: string;
    ref: Ref;
    options: { text: string; votes: number }[];
}

const schema = new Schema<IPoll>({
    identifier: {
        type: String,
        required: true,
        trim: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        trim: true,
    },

    ref: {
        type: String,
        enum: [REFERENCES.BLOG],
        default: REFERENCES.BLOG,
    },

    options: [
        {
            text: {
                type: String,
                required: true,
                trim: true,
            },

            votes: {
                type: Number,
                default: 0,
            },
        },
    ],
});

const PollModel = model<IPoll>("Poll", schema);

export default PollModel;