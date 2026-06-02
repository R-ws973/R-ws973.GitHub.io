document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".card");
    if (cards.length === 0) return;

    function ensureModal() {
        let modal = document.getElementById("workModal");
        if (modal) return modal;

        const modalHtml = `
            <div class="work-modal" id="workModal" aria-hidden="true">
                <div class="work-modal__backdrop" data-close="true"></div>
                <div class="work-modal__panel" role="dialog" aria-modal="true" aria-labelledby="workModalTitle">
                    <button class="work-modal__close" id="workModalClose" aria-label="닫기">닫기</button>
                    <div class="work-modal__image-wrap">
                        <img id="workModalImage" src="" alt="작품 확대 이미지">
                        <div id="workModalThumb" class="work-modal__thumb-preview"><span></span></div>
                        <div id="workModalNoImage">등록된 이미지가 없습니다.</div>
                    </div>
                    <h3 id="workModalTitle"></h3>
                    <p id="workModalMeta" class="meta"></p>
                    <p id="workModalDesc"></p>
                    <p id="workModalTag" class="tag"></p>
                    <p class="work-modal__link">
                        <a id="workModalLink" href="#" target="_blank" rel="noopener noreferrer">작품 보러가기</a>
                    </p>
                    <p class="work-modal__url" id="workModalUrl"></p>
                </div>
            </div>`;

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        return document.getElementById("workModal");
    }

    const modal = ensureModal();
    const modalTitle = document.getElementById("workModalTitle");
    const modalMeta = document.getElementById("workModalMeta");
    const modalDesc = document.getElementById("workModalDesc");
    const modalTag = document.getElementById("workModalTag");
    const modalImage = document.getElementById("workModalImage");
    const modalThumb = document.getElementById("workModalThumb");
    const noImage = document.getElementById("workModalNoImage");
    const modalLink = document.getElementById("workModalLink");
    const modalUrl = document.getElementById("workModalUrl");
    const closeButton = document.getElementById("workModalClose");

    let openerCard = null;

    function pickText(card, selector) {
        const el = card.querySelector(selector);
        return el ? el.textContent.trim() : "";
    }

    function pickDescription(card) {
        const desc = card.querySelector("p:not(.meta):not(.tag)");
        return desc ? desc.textContent.trim() : "소개 문구가 아직 없습니다.";
    }

    function getCardUrl(card, title) {
        const customUrl = (card.dataset.url || "").trim();
        if (customUrl) {
            return { href: customUrl, text: "작품 보러가기" };
        }

        const searchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(title + " 웹툰")}`;
        return { href: searchUrl, text: "작품 검색하기" };
    }

    function setImage(card) {
        const cardImage = card.querySelector(".card-image");
        const cardCover = card.querySelector(".card-cover");
        const hasRealImage =
            cardImage && cardImage.style.display !== "none" && (cardImage.getAttribute("src") || "").trim() !== "";

        if (hasRealImage) {
            modalImage.src = cardImage.getAttribute("src");
            modalImage.alt = (cardImage.getAttribute("alt") || "작품 이미지") + " 확대";
            modalImage.style.display = "block";
            modalThumb.style.display = "none";
            noImage.style.display = "none";
        } else {
            modalImage.removeAttribute("src");
            modalImage.style.display = "none";

            if (cardCover) {
                modalThumb.className = "work-modal__thumb-preview";
                cardCover.classList.forEach((className) => {
                    if (className !== "card-cover" && className !== "empty") {
                        modalThumb.classList.add(className);
                    }
                });

                const label = cardCover.querySelector("span");
                const labelText = label ? label.textContent.trim() : "가상 썸네일";
                const modalThumbLabel = modalThumb.querySelector("span");
                if (modalThumbLabel) {
                    modalThumbLabel.textContent = labelText;
                }

                modalThumb.style.display = "flex";
                noImage.style.display = "none";
            } else {
                modalThumb.style.display = "none";
                noImage.style.display = "block";
            }
        }
    }

    function bindImageFallback() {
        const images = document.querySelectorAll(".card-image");
        images.forEach((img) => {
            const cover = img.closest(".card-cover");
            if (!cover) return;

            img.addEventListener("error", () => {
                img.style.display = "none";
                cover.classList.add("empty");
            });

            if (img.complete && img.naturalWidth === 0) {
                img.style.display = "none";
                cover.classList.add("empty");
            }
        });
    }

    function openModal(card) {
        openerCard = card;

        const title = pickText(card, "h3");
        modalTitle.textContent = title;
        modalMeta.textContent = pickText(card, ".meta");
        modalDesc.textContent = pickDescription(card);
        modalTag.textContent = pickText(card, ".tag");

        const linkInfo = getCardUrl(card, title);
        modalLink.href = linkInfo.href;
        modalLink.textContent = linkInfo.text;
        modalUrl.textContent = "사이트 주소: " + linkInfo.href;

        setImage(card);

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        closeButton.focus();
    }

    function closeModal() {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

        if (openerCard) {
            openerCard.focus();
        }
    }

    cards.forEach((card) => {
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `${pickText(card, "h3")} 상세 보기`);

        card.addEventListener("click", () => openModal(card));
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openModal(card);
            }
        });
    });

    bindImageFallback();

    modal.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.dataset.close === "true") {
            closeModal();
        }
    });

    closeButton.addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("open")) {
            closeModal();
        }
    });
});
