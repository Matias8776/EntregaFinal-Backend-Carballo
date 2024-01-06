export class UserDTO {
  constructor (user) {
    this.id = user.user.id;
    this.name = user.user.name.replace(/\b\w/g, (l) => l.toUpperCase());
    this.age = user.user.age;
    this.role = user.user.role.replace(/\b\w/g, (l) => l.toUpperCase());
    this.email = user.user.email;
  }
}

export class UsersDTO {
  constructor (user) {
    this.name = user.name.replace(/\b\w/g, (l) => l.toUpperCase());
    this.email = user.email;
    this.role = user.role.replace(/\b\w/g, (l) => l.toUpperCase());
  }
}
