const canvasMock = {
  Canvas: function () {},
  Image: function () {},
  createCanvas: function () {
    return {};
  },
  loadImage: function () {
    return Promise.resolve({});
  },
};

module.exports = canvasMock;
export default canvasMock;
