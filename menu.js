/* Постер — оставляем размеры как есть */
.card__img,
.card__poster,
.card__view img {
    border-radius: 1em !important;
    transition: box-shadow 0.3s ease !important;
}

/* Яркая рамка с визуальным зазором */
.card.selector.focus .card__img,
.card.selector.hover .card__img,
.card.selector.traverse .card__img,
.card.selector.focus .card__poster,
.card.selector.hover .card__poster,
.card.selector.traverse .card__poster,
.card.selector.focus .card__view img,
.card.selector.hover .card__view img,
.card.selector.traverse .card__view img {
    box-shadow:
        0 0 0 8px rgba(96, 255, 189, 0.9),   /* толстая линия — создаёт эффект зазора */
        0 0 16px rgba(96, 255, 189, 0.7),
        0 0 32px rgba(98, 163, 201, 0.6) !important;
}
