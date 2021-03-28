module.exports = {
  sortByOrder(values) {
    let vals = [...values]; // this *seems* to prevent collection mutation...
    return vals.sort((a, b) => a.data.datepub.localeCompare(b.data.datepub));
  },
  sortByOrder2(values) {
    let vals = [...values]; // this *seems* to prevent collection mutation...
    return vals.sort((a, b) =>
      a.data.orderDate.localeCompare(b.data.orderDate)
    );
  },
  randomPost(values) {
    let vals = [...values]; // this *seems* to prevent collection mutation...

    return vals.sort((a, b) => 0.5 - Math.random());
  },
};
