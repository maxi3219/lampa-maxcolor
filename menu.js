.card__img,
.card__poster,
.card__view img {
    position: relative !important;
    border-radius: 1em !important;
    z-index: 1 !important;
}

/* Градиентная рамка с прозрачным зазором */
.card.selector.focus .card__img::after,
.card.selector.hover .card__img::after,
.card.selector.traverse .card__img::after,
.card.selector.focus .card__poster::after,
.card.selector.hover .card__poster::after,
.card.selector.traverse .card__poster::after,
.card.selector.focus .card__view img::after,
.card.selector.hover .card__view img::after,
.card.selector.traverse .card__view img::after {
    content: "" !important;
    position: absolute !important;
    inset: -8px !important; /* зазор */
    border-radius: calc(1em + 8px) !important;
    background: linear-gradient(to right, #60ffbd 1%, #62a3c9 100%) !important;

    /* маска: вырезаем внутреннюю часть, оставляем только кольцо */
    -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0) !important;
    -webkit-mask-composite: xor !important;
    mask-composite: exclude !important;

    pointer-events: none !important;
    z-index: 2 !important;
}
