/**
 * Все картинки сайта в одном месте. Файлы лежат в public/images/,
 * подписи — в locales (media.captions[id]).
 */
export const IMAGES = {
    boyTurnaround: "/images/boy-turnaround.webp",
    boyDetails: "/images/boy-details.webp",
    boyPoses: "/images/boy-poses.webp",
    alvastiTurnaround: "/images/alvasti-turnaround.webp",
    alvastiDetails: "/images/alvasti-details.webp",
    alvastiPoses: "/images/alvasti-poses.webp",
    alvastiFeet: "/images/alvasti-feet.webp",
    houseDiorama: "/images/house-diorama.webp",
    houseMap: "/images/house-map.webp",
    sceneDoor: "/images/scene-door.webp",
    sceneUnderSandal: "/images/scene-under-sandal.webp",
    sceneHiding: "/images/scene-hiding.webp",
    sceneGrandmotherRoom: "/images/scene-grandmother-room.webp",
    prototype: "/images/prototype-unity.webp",
} as const;

export type ImageId = keyof typeof IMAGES;

/** Кадры из игры — для галереи на главной. */
export const SCENES: ImageId[] = ["sceneDoor", "sceneUnderSandal", "sceneHiding", "sceneGrandmotherRoom", "houseDiorama"];

/** Полный порядок для страницы «Медиа». */
export const ALL_MEDIA: ImageId[] = [
    "sceneDoor", "sceneUnderSandal", "sceneHiding", "sceneGrandmotherRoom",
    "houseDiorama", "houseMap",
    "boyTurnaround", "boyPoses", "boyDetails",
    "alvastiTurnaround", "alvastiPoses", "alvastiDetails", "alvastiFeet",
    "prototype",
];
