 

module.exports = {

 sortByOrder(values) {
    let vals = [...values];     // this *seems* to prevent collection mutation...
    return vals.sort((a, b) =>  a.data.datepub.localeCompare(b.data.datepub));
},
};
