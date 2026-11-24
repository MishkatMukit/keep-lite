import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { noteServices } from "./note.service";

const postNote= catchAsync(async (req, res) => {

    const note = req.body 

    const result = await noteServices.postNote(note)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Example module is working",
    data: result,
  });
});

export const noteController = { 
    postNote 
};
