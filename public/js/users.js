class Users{
    constructor(){
        this.users = [];
    }
    addUser(id,name,grp){
        let user = {id,name,grp};
        this.users.push(user);
        return user;
    }
    removeUser(id){
        let user = this.getUser(id);
        if(user){
            this.users = this.users.filter((user)=> user.id !== id);
        }
        return user;
    }
    getUser(id){
        return this.users.filter((user)=> user.id === id)[0];
    }
    getUserList(grp){
        let users = this.users.filter((user)=> user.grp === grp);
        let namesArray = users.map((user)=> user.name);
        return namesArray;
    }
}
module.exports = {Users};