const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

module.exports.validateUser = async function (password, resultRow) {
    var encryptedPassword = resultRow["encrypted_password"].toString('utf8');
    return await bcrypt.compare(password, encryptedPassword);
}

module.exports.encryptPassword = async function (password) {
    var hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
}
