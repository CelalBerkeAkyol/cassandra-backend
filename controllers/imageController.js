const addImageToPost = async (postId, imageData) => {
  try {
    // Yeni bir resim oluştur
    const newImage = await Image.create({
      url: imageData.url,
      altText: imageData.altText,
      blogPost: postId, // Resmi blog yazısına bağla
    });

    // İlgili postun images alanını güncelle
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { images: newImage._id } }, // Yeni resmi ekle
      { new: true, runValidators: true }
    );

    return { success: true, post: updatedPost };
  } catch (error) {
    console.error("Hata:", error.message);
    return { success: false, error: error.message };
  }
};
