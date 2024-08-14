//be careful since exists JwtPayload in NestJS
export interface JwtPayload {
    id: string;
    email: string;

    name: string;
}
// if you change email and name it would be better regenerate
// jwt to it be part of jwt or only save id and when you make verification rebuild the user
// like it is in database