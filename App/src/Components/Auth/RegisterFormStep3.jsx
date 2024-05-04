import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { setRegistrationData } from "../../Store/Auth/index.js";

function RegisterFormStep3({ register, setImageFileContext }) {
  const auth = useSelector((state) => state.auth);
  const global = useSelector((state) => state.global);
  const dispatch = useDispatch();

  const file = useRef(null);
  const image = useRef(null);

  const handleFileImport = function (event) {
    const file = event.target.files[0];
    setImageFileContext(file);
    const reader = new FileReader();
    reader.onload = function (event) {
      image.current.src = event.target.result;
      dispatch(setRegistrationData({ image: file.name }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 1, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2 ">
        <label
          htmlFor="image"
          className="text-sm font-medium text-quaternary-500 flex flex-col gap-1"
        >
          Profile Picture
          <span className="font-['Poppins-light'] font-light text-xs text-tertiary-500">
            Image Should be 300x300 pixels
          </span>
          {auth.errors && auth.errors.image && (
            <motion.span
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              exit={{ opacity: 0, height: 0 }}
              className="h-0 text-sm text-red-500 overflow-hidden"
            >
              {auth.errors.image}
            </motion.span>
          )}
          <motion.div
            whileTap={{ scale: 0.95 }}
            transition={{
              duration: 0.3,
              damping: 2,
              stiffness: 10,
            }}
            className="mt-4 w-[300px] aspect-square mx-auto
            border border-gray-300 text-gray-900 sm:text-sm rounded-full
            bg-tertiary-500 placeholder:text-secondary-500 outline-none transition-all duration-300
            flex justify-center items-center relative group cursor-pointer"
          >
            <img
              ref={image}
              src=""
              className={`
                w-full
                aspect-square
                object-cover rounded-full
                ${auth.registration.data.image != null ? "block" : "hidden"}
              `}
            />
            {auth.registration.data.image == null ? (
              <i className="fas fa-image text-4xl text-secondary-500 transition-all duration-300 group-hover:scale-105"></i>
            ) : null}
          </motion.div>
        </label>
        <input
          type="file"
          id="image"
          {...register("image", { reauired: true })}
          ref={file}
          className="hidden"
          onChange={handleFileImport}
        />
      </div>
    </motion.div>
  );
}

export default RegisterFormStep3;
