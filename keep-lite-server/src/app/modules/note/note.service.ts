import { prisma } from "../../lib/prisma";

const postNote = async (note : any) => {
    const result =  await prisma.note.create({
        data : note
    })
}

export const noteServices = {
    postNote
};