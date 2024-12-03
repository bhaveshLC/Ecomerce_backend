const Order = require("../model/order");
var shortid = require("shortid");
const Product = require("../model/product");

async function handleCreateOrder(req, res) {
  const { items, deliveryFee, total, address } = req.body;
  const groupItems = {};
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = products.reduce((map, product) => {
    map[product._id.toString()] = product;
    return map;
  }, {});
  for (let item of items) {
    const product = productMap[item.productId];
    if (product) {
      const sellerId = product._org;
      item.sellerId = sellerId;

      if (!groupItems[sellerId]) {
        groupItems[sellerId] = [];
      }
      groupItems[sellerId].push(item);
    } else {
      console.error(`Product with ID ${item.productId} not found.`);
    }
  }

  const orders = [];

  for (let sellerId in groupItems) {
    const sellerItems = groupItems[sellerId];

    const sellerTotal = sellerItems.reduce(
      (sum, item) => sum + item.subTotal,
      0
    );
    const sellerDeliveryFee = deliveryFee / Object.keys(groupItems).length;

    const order = await Order.create({
      items: sellerItems,
      deliveryFee: sellerDeliveryFee,
      total: sellerTotal + sellerDeliveryFee,
      address,
      paymentStatus: "Pending",
      status: "Pending",
      sellerId,
      createdBy: req.user._id,
      deleted: false,
    });

    orders.push(order);
  }

  return res.status(200).json({ orders });
}

async function handleConfirmOrder(req, res) {
  const { orderId } = req.params;

  const { nameOnCard, cardNumber, expiry, cvv } = req.body;
  if (cardNumber.length != 16 || cvv.length !== 3) {
    return res.status(400).json({ message: "Invalid card details..." });
  }
  const [expirayMonth, expirayYear] = expiry.split("/").map(Number);
  const currDate = new Date();
  const currMonth = currDate.getMonth() + 1;
  const currYear = currDate.getFullYear();
  if (
    expirayYear < currYear ||
    (expirayYear === currYear && expirayMonth < currMonth)
  ) {
    return res
      .status(400)
      .json({ message: "Card is Expired. Please check your expiray..." });
  }
  if (cardNumber == "4111111111111111" || cardNumber == "5555555555554444") {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order Not Found..." });
    }
    order.status = "Confirmed";
    order.paymentStatus = "Paid";
    order.transactionNo = shortid.generate();
    await order.save();
    return res.status(200).json({ order, message: "Order Confirmed" });
  } else if (cardNumber == "4000000000009995") {
    return res
      .status(400)
      .json({ message: " Decline due to Insufficient Balance..." });
  } else if (cardNumber == "4000000000000127") {
    return res
      .status(400)
      .json({ message: "Decline due to Incorrect Card Details " });
  }
}
async function handleOrderHistory(req, res) {
  const user = req.user;
  const { limit = 10, page = 1 } = req.query;
  const itemsPerPage = parseInt(limit, 10);
  const currentPage = parseInt(page, 10);
  const filterQuery = { createdBy: user._id };
  const orderList = await Order.find(filterQuery)
    .skip((currentPage - 1) * itemsPerPage)
    .limit(itemsPerPage);
  const totalResults = await Order.countDocuments(filterQuery);
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  return res.status(200).json({
    orders: orderList,
    page: currentPage,
    limit: itemsPerPage,
    totalPages,
    totalResults,
  });
}
async function handleOrderDetails(req, res) {
  const { orderId } = req.params;
  const user = req.user;
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order Not Found..." });
  }
  return res.status(200).json(order);
}
async function handleCancelOrder(req, res) {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "No Order FOund..." });
  }
  order.status = "Cancelled";
  await order.save();
  setTimeout(async () => {
    order.paymentStatus = "Refunded";
    await order.save();
  }, 5 * 60 * 1000);
  return res.status(200).json(order);
}
async function handleSellerOrderHistory(req, res) {
  const seller = req.user;
  const orders = await Order.find({
    sellerId: seller._org._id,
    paymentStatus: { $ne: "Pending" },
  });
  return res.json({ orders });
}
async function handleSellerOrderDetails(req, res) {
  const sellerId = req.user._org._id.toString();
  const { orderId } = req.params;
  console.log(sellerId);

  const orders = await Order.findOne({ _id: orderId, sellerId: sellerId });
  return res.json(orders);
}
async function handleOrderActions(req, res) {
  const { orderId, action } = req.params;
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order Not Found..." });
  }
  if (action == "cancel") {
    if (order.status == "Delivered") {
      return res.json({ message: "Order is already Delivered." });
    }
    order.status = "Cancelled";
  } else if (action == "dispatch") {
    if (order.status == "Cancelled") {
      return res.json({ message: "Order is already Cancelled." });
    }
    order.status = "Dispatched";
    setTimeout(async () => {
      order.paymentStatus = "Refunded";
      await order.save();
    }, 5 * 60 * 1000);
  } else if (action == "deliver") {
    if (order.status == "Cancelled") {
      return res.json({ message: "Order is already Cancelled." });
    }
    order.status = "Delivered";
  } else {
    return res.json({ message: "Invalid action" });
  }

  await order.save();
  res.status(200).json(order);
}
module.exports = {
  handleCreateOrder,
  handleConfirmOrder,
  handleOrderHistory,
  handleOrderDetails,
  handleCancelOrder,
  handleSellerOrderHistory,
  handleSellerOrderDetails,
  handleOrderActions,
};
