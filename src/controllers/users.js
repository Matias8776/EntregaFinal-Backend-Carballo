import mongoose from 'mongoose';
import cartsModel from '../dao/models/carts.js';
import usersModel from '../dao/models/users.js';
import CustomError from '../services/errors/CustomError.js';
import EErrors from '../services/errors/enums.js';
import { ChangeRolError, notFoundUserError } from '../services/errors/info.js';
import response from '../services/res/response.js';
import { passportCall, sendDeleteUserAdminEmail, sendDeleteUserEmail, upload } from '../utils.js';
import { UsersDTO } from '../dao/DTOs/Users.js';

export const passportAdmin = passportCall('admin');

export const uploaderDocuments = upload.any(
  'Identificación',
  'Comprobante de domicilio',
  'Comprobante de estado de cuenta'
);

export const getUsers = async (req, res, next) => {
  const users = await usersModel.find();

  if (users.length === 0) {
    const error = new CustomError({
      name: 'No existen usuarios',
      cause: 'No existen usuarios',
      message: 'No existen usuarios',
      code: EErrors.NOT_FOUND
    });
    next(error);
  } else {
    const returnedUsers = users.map((user) => {
      user.name = `${user.first_name} ${user.last_name}`;
      return new UsersDTO(user);
    });
    response(res, 200, returnedUsers);
  }
};

export const changeRole = async (req, res, next) => {
  let uid = req.params.uid;
  if (!mongoose.Types.ObjectId.isValid(uid)) {
    uid = null;
  }
  const user = await usersModel.findById(uid);
  if (!user) {
    const error = new CustomError({
      name: 'No existe el usuario',
      cause: notFoundUserError(),
      message: 'No existe el usuario con ese id',
      code: EErrors.NOT_FOUND
    });
    next(error);
  } else {
    if (user.role === 'premium') {
      user.role = 'user';
      await user.save();
      response(res, 200, user.role);
    } else {
      if (user.role === 'user' && (user.status === true || req.session.user.role === 'admin')) {
        user.role = 'premium';
        await user.save();
        response(res, 200, user.role);
      } else {
        const error = new CustomError({
          name: 'No se puede cambiar el rol',
          cause: ChangeRolError(),
          message:
            'No se puede cambiar el rol del usuario debido a que faltan documentos por cargar',
          code: EErrors.INVALID_TYPES
        });
        next(error);
      }
    }
  }
};

export const deleteInactiveUsers = async (req, res, next) => {
  const users = await usersModel.find();

  if (users.length === 0) {
    const error = new CustomError({
      name: 'No existen usuarios',
      cause: 'No existen usuarios',
      message: 'No existen usuarios',
      code: EErrors.NOT_FOUND
    });
    next(error);
  } else {
    const deletedUsers = [];
    const actuallyDate = new Date();
    const twoDays = 2 * 24 * 60 * 60 * 1000;

    users.forEach(async (user) => {
      const lastConnection = new Date(user.last_connection);
      const timeDifference = actuallyDate - lastConnection;

      if (timeDifference > twoDays) {
        deletedUsers.push(user.email);
        await sendDeleteUserEmail(user.email);
        await cartsModel.findByIdAndDelete(user.cart);
        await usersModel.findByIdAndDelete(user._id);
      }
    });
    response(res, 200, `Se han eliminado los usuarios inactivos: ${deletedUsers}`);
  }
};

export const deleteUser = async (req, res, next) => {
  let uid = req.params.uid;
  if (!mongoose.Types.ObjectId.isValid(uid)) {
    uid = null;
  }
  const user = await usersModel.findById(uid);
  if (!user) {
    const error = new CustomError({
      name: 'No existe el usuario',
      cause: notFoundUserError(),
      message: 'No existe el usuario con ese id',
      code: EErrors.NOT_FOUND
    });
    next(error);
  } else {
    const cid = user.cart;
    try {
      await sendDeleteUserAdminEmail(user.email);
      await cartsModel.findByIdAndDelete(cid);
      await usersModel.findByIdAndDelete(uid);
      response(res, 200, 'Usuario eliminado');
    } catch (error) {
      return { error: error.message };
    }
  }
};

export const addDocuments = async (req, res, next) => {
  let uid = req.params.uid;
  if (!mongoose.Types.ObjectId.isValid(uid)) {
    uid = null;
  }
  const user = await usersModel.findById(uid);
  if (!user) {
    const error = new CustomError({
      name: 'No existe el usuario',
      cause: notFoundUserError(),
      message: 'No existe el usuario con ese id',
      code: EErrors.NOT_FOUND
    });
    next(error);
  } else {
    const uploadedDocuments = req.files.map((file) => ({
      name: file.fieldname,
      reference: file.filename
    }));
    try {
      const requiredDocuments = [
        'Identificacion',
        'Comprobante de domicilio',
        'Comprobante de estado de cuenta'
      ];

      const hasAllRequiredDocuments = requiredDocuments.every((docName) =>
        uploadedDocuments.some((doc) => doc.name === docName)
      );

      if (hasAllRequiredDocuments) {
        user.documents.push(...uploadedDocuments);
        user.status = true;
        await user.save();

        response(
          res,
          200,
          'Documentos subidos y status actualizado correctamente'
        );
      } else {
        response(res, 400, 'Faltan documentos requeridos');
      }
    } catch (error) {
      console.error(error);
      return { error: error.message };
    }
  }
};
