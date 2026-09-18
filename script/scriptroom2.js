document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       REGISTER BUTTON
    ====================================================== */

    const registerBtn = document.getElementById("registerBtn");

    if (registerBtn) {

        registerBtn.addEventListener("click", function () {

            window.location.href = "register.html";

        });

    }


    /* =====================================================
       PRICE SLIDER
    ====================================================== */

    const priceRange = document.getElementById("priceRange");

    const maxPrice = document.getElementById("maxPrice");

    if (priceRange && maxPrice) {

        priceRange.addEventListener("input", function () {

            maxPrice.value = this.value;

        });

    }


    /* =====================================================
       CLEAR FILTER
    ====================================================== */

    const clearFilter = document.getElementById("clearFilter");

    if (clearFilter) {

        clearFilter.addEventListener("click", function () {

            document.getElementById("minPrice").value = 100;

            document.getElementById("maxPrice").value = 150;

            document.getElementById("priceRange").value = 150;

            document.getElementById("roomSearch").value = "";

            showAllRooms();

        });

    }


    /* =====================================================
       ROOM SEARCH
    ====================================================== */

    const searchButton = document.getElementById("searchRoomBtn");

    const searchInput = document.getElementById("roomSearch");

    if (searchButton) {

        searchButton.addEventListener("click", function () {

            searchRooms();

        });

    }


    if (searchInput) {

        searchInput.addEventListener("keyup", function (event) {

            if (event.key === "Enter") {

                searchRooms();

            }

        });

    }


    /* =====================================================
       SEARCH ROOMS FUNCTION
    ====================================================== */

    function searchRooms() {

        const searchValue =
            searchInput.value.toLowerCase().trim();

        const min =
            Number(document.getElementById("minPrice").value) || 0;

        const max =
            Number(document.getElementById("maxPrice").value) || 999999;

        const rooms =
            document.querySelectorAll(".room");

        let found = 0;

        rooms.forEach(function (room) {

            const roomName =
                room.dataset.name.toLowerCase();

            const roomPrice =
                Number(room.dataset.price);

            const nameMatch =
                roomName.includes(searchValue);

            const priceMatch =
                roomPrice >= min &&
                roomPrice <= max;

            if (nameMatch && priceMatch) {

                room.style.display = "";

                found++;

            } else {

                room.style.display = "none";

            }

        });


        const noResult =
            document.getElementById("noResult");

        if (found === 0) {

            noResult.style.display = "block";

        } else {

            noResult.style.display = "none";

        }

    }


    /* =====================================================
       SHOW ALL ROOMS
    ====================================================== */

    function showAllRooms() {

        const rooms =
            document.querySelectorAll(".room");

        rooms.forEach(function (room) {

            room.style.display = "";

        });

        document.getElementById("noResult")
            .style.display = "none";

    }


    /* =====================================================
       ROOM MORE INFORMATION MODAL
    ====================================================== */

    const moreButtons =
        document.querySelectorAll(".more-btn");

    const modal =
        document.getElementById("roomModal");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalImage =
        document.getElementById("modalImage");

    const modalDescription =
        document.getElementById("modalDescription");

    const modalClose =
        document.getElementById("modalClose");


    const roomData = {

        "Junior Villa One Bedroom": {

            image: "images/room1.png",

            description:
                "A comfortable Junior Villa with one bedroom, modern facilities, free Wi-Fi and a beautiful resort atmosphere."

        },

        "Premium Triple Balcony Sea View": {

            image: "images/room2.png",

            description:
                "A spacious premium room with balcony, sea view and comfortable facilities for up to three guests."

        },

        "Deluxe Twin Room": {

            image: "images/room2.png",

            description:
                "A modern Deluxe Twin Room with two comfortable beds, free Wi-Fi and a relaxing resort environment."

        },

        "Deluxe Double Room": {

            image: "images/room3.png",

            description:
                "An elegant Deluxe Double Room designed for couples and guests looking for a comfortable stay."

        },

        "Prince Villa 4 Bedrooms": {

            image: "images/room.jpg",

            description:
                "A large private villa with four bedrooms, ideal for families and groups who want more space and privacy."

        },

        "Deluxe One Room": {

            image: "images/room2.png",

            description:
                "A comfortable Deluxe One Room with modern design, quality facilities and a relaxing atmosphere."

        }

    };


    moreButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const roomName =
                this.dataset.room;

            const data =
                roomData[roomName];

            if (!data) {
                return;
            }

            modalTitle.textContent =
                roomName;

            modalImage.src =
                data.image;

            modalDescription.textContent =
                data.description;

            modal.classList.add("show");

        });

    });


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    if (modalClose) {

        modalClose.addEventListener("click", function () {

            modal.classList.remove("show");

        });

    }


    /* =====================================================
       CLICK OUTSIDE MODAL
    ====================================================== */

    if (modal) {

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {

                modal.classList.remove("show");

            }

        });

    }


    /* =====================================================
       ESC CLOSE MODAL
    ====================================================== */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            modal.classList.remove("show");

        }

    });


    /* =====================================================
       BOOK BUTTON
    ====================================================== */

    const bookBtn =
        document.getElementById("bookBtn");

    if (bookBtn) {

        bookBtn.addEventListener("click", function () {

            window.location.href = "register.html";

        });

    }


    /* =====================================================
       GALLERY THUMBNAILS
    ====================================================== */

    const thumbnails =
        document.querySelectorAll(".thumbnail");

    const mainImage =
        document.getElementById("mainRoomImage");


    thumbnails.forEach(function (thumbnail) {

        thumbnail.addEventListener("click", function () {

            mainImage.src =
                this.src;

            thumbnails.forEach(function (item) {

                item.classList.remove(
                    "active-thumb"
                );

            });

            this.classList.add(
                "active-thumb"
            );

        });

    });


    /* =====================================================
       SHOW MAP
    ====================================================== */

    const showMapBtn =
        document.getElementById("showMapBtn");

    if (showMapBtn) {

        showMapBtn.addEventListener("click", function () {

            alert(
                "Solara Resort location:\n\nJl. Campuhan, 80571 Ubud, Cambodia."
            );

        });

    }


    /* =====================================================
       SHARE CURRENT PAGE
    ====================================================== */

    const shareBtn =
        document.getElementById("shareBtn");

    if (shareBtn) {

        shareBtn.addEventListener("click", async function () {

            const shareData = {

                title: "Solara Resort",

                text: "Check out Solara Resort",

                url: window.location.href

            };


            if (navigator.share) {

                try {

                    await navigator.share(
                        shareData
                    );

                } catch (error) {

                    console.log(
                        "Share cancelled."
                    );

                }

            } else {

                try {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );

                    alert(
                        "Page URL copied to clipboard!"
                    );

                } catch (error) {

                    alert(
                        "Copy this page URL:\n" +
                        window.location.href
                    );

                }

            }

        });

    }

});