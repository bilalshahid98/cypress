class ValidatorService {
  validate(fields, body) {
    return new Promise((resolve, reject) => {
      try {
        fields.forEach((element, index) => {
          if (
            !body[fields[index]] ||
            body[fields[index]] === "" ||
            body[fields[index]] === " "
          ) {
            let err_message;
            err_message = `${fields[index]} is required`;
            if (fields[index] == "your_password") {
              err_message = "Password is required";
            } else if (fields[index] == "full_name") {
              err_message = "Your name is required";
            }
            reject(err_message.charAt(0).toUpperCase() + err_message.slice(1));
          } else if (
            fields[index] === "email" &&
            !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
              body[fields[index]]
            )
          ) {
            reject(`Enter a valid email`);
          } else if (
            (fields[index] === "phone" || fields[index] === "contact") &&
            body[fields[index]].length < 10 && !/^(93|03|3)/.test(body[fields[index]])
          ) {
            reject(`Enter a valid contact Ex: 3*********`);
          } else if (
            fields[index] === "password" &&
            (body[fields[index]].length < 8 || body[fields[index]].length > 20)
          ) {
            reject(`Enter a password in between 8 to 20 characters`);
          } else if (
            fields[index] === "contact" &&
            body[fields[index]].length < 10
          ) {
            reject(`Enter a Valid Contact`);
          }
        });
        resolve(false);
      } catch (error) {
        reject(error.message);
      }
    });
  }
}
export default new ValidatorService();
