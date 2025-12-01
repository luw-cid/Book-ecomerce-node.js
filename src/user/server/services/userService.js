// services/userService.js
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const AppError = require("../errors");

// Lấy thông tin user
const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    return user;
};

// Cập nhật profile
const updateUserProfile = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select('-password');
    
    return user;
};

// Thay đổi mật khẩu
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new AppError("User not found", 404);
    }
    
    // Kiểm tra mật khẩu hiện tại (chỉ cho user đăng ký bằng email/password)
    if (user.password) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new AppError("Current password is incorrect", 401);
        }
    } else {
        throw new AppError("Cannot change password for social login accounts", 400);
    }
    
    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    return true;
};

// Upload avatar (giả lập - trong thực tế sẽ upload lên cloud storage)
const uploadAvatar = async (userId, file) => {
    // Trong thực tế, bạn sẽ upload file lên cloud storage như AWS S3, Cloudinary, etc.
    // Ở đây chúng ta giả lập bằng cách lưu đường dẫn local
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
    
    return avatarUrl;
};

// ============ Shipping Addresses ============
const getShippingAddresses = async (userId) => {
    const user = await User.findById(userId).select('addresses');
    if (!user) throw new AppError("User not found", 404);
    return user.addresses || [];
};

const addShippingAddress = async (userId, addressData) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    // Nếu là địa chỉ đầu tiên, set default = true
    const isFirst = !user.addresses || user.addresses.length === 0;
    const isDefault = addressData.isDefault || isFirst;

    if (isDefault && user.addresses && user.addresses.length > 0) {
        user.addresses.forEach(a => { a.isDefault = false; });
    }

    user.addresses.push({
        fullName: addressData.fullName,
        phone: addressData.phone,
        address: addressData.address,
        city: addressData.city,
        district: addressData.district,
        ward: addressData.ward,
        isDefault
    });

    await user.save();
    return user.addresses;
};

const updateShippingAddress = async (userId, addressId, updateData) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const addr = user.addresses.id(addressId);
    if (!addr) throw new AppError("Address not found", 404);

    addr.fullName = updateData.fullName ?? addr.fullName;
    addr.phone = updateData.phone ?? addr.phone;
    addr.address = updateData.address ?? addr.address;
    addr.city = updateData.city ?? addr.city;
    addr.district = updateData.district ?? addr.district;
    addr.ward = updateData.ward ?? addr.ward;

    await user.save();
    return user.addresses;
};

const deleteShippingAddress = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const addr = user.addresses.id(addressId);
    if (!addr) throw new AppError("Address not found", 404);

    const wasDefault = addr.isDefault;
    addr.remove();

    // Nếu xóa default, set default cho địa chỉ đầu tiên nếu có
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();
    return user.addresses;
};

const setDefaultShippingAddress = async (userId, addressId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const addr = user.addresses.id(addressId);
    if (!addr) throw new AppError("Address not found", 404);

    user.addresses.forEach(a => { a.isDefault = false; });
    addr.isDefault = true;

    await user.save();
    return user.addresses;
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword,
    uploadAvatar,
    getShippingAddresses,
    addShippingAddress,
    updateShippingAddress,
    deleteShippingAddress,
    setDefaultShippingAddress
};
