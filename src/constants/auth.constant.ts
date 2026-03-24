import 'dotenv/config';

const DEFAULT_DEV_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCjFoKfSGfW6yso
88m22Kq+TOZcLIlrXsXlB+yzeCePeyQql2jJnoNeT5I/ldffosebTwi1+ySBH1e9
WWxrAiMcCAM1X4RsnBLFOIKN3vrTRedThg4x2q1ZXgltsTZOGtgGXzRaA7BWR2ee
Vk9S0ndaPDowJcl+mqjvYrmy/K4nChZvHvt4sZebF6bgAOjr9Q3BYFd7q+8MlMRd
Qbi97gPvhRLjz3ezYdcujZU7vRE0TOf+YAHnwc8/oiVSKR3q4SVm0daGfpVQdjqC
nG3RV36QoQObqx9VJRhjCkQKkjGmYcrTNlvgU4R58OP1MaElkMe8L3O69ckF6A+C
RSlWClrVAgMBAAECggEALUpbDBD3hV/ZpI3PPs/82sxQTNixcPfozSneOhjsI5R2
/rz9hMBYiyBd5Pqf8KMr+51/NcqA4LrritICodT+GxK+kVvtUpwlOk/vMaby0Slg
jHl2B7JK4b6Tr7q+8gHSbDKUP0s29T7vL7GYZc+9BXokTqqvwlEBCTnJiENTudNJ
0gZzfMFDZJPzWUlJ5keJZNPjKPICpK6NMbTQXZPELpHHuuZ2BfTLqotacDHpEvOB
kWNS91n3Ybj7uRJxhpqipT2xI/HoyJ3KMKgPKja08/vYaF2Dq1YREacnHr6KiNc7
kVNz54CmzZ5yAF2NDs4gkFgvHT7muHrAGLPEXr7FIQKBgQDRVofSXiBL2J9wxjRU
jQzUk87gtwe1FH0cJrPLM3MpeYopiSHmDBd4HmVB6vwPLNv0F/iEtyYwTHRUKgLb
MVrWZPuihy5M88/pX9w7XcsZEElhJl0wYT1vPvT9EP++hrjyzjtkSQe/k2gCy5Jj
ut12wtEUQHsoeuurmPJv/WafpwKBgQDHcM7lis2bzAssWYl36EhwXhsV0GJY7rxe
9D9axX+q1DG8gKANe+2DazS+9E7GUjUjF7wpNO1VaucvidleKqszNvHoWxfXAt9x
ALxfp8qF++LhwICDlu7M7bquh51YzQoeOo6kZEHHLOcu0sHSdFVAkQuPc4e8rvlY
DCb98+IhIwKBgFrNKM7kCyg7BzW4k3xVTkpq7qJkYdB22am7U+OBJqPH11ka5XxO
pGNy88L69WhzsdiYCTEv7D2o/BCBxIllSByU4t1lu3yfiQCWlwWdMnplqR6dsHBK
zYYSjduzYus2rsSLFhHy54x+mPAVcyMVK/jWmjAppAI0B0OAbTCMftYjAoGBAJQe
E4omK80pHKMzXATRXfsV6Meqm1+w7fUXMHYZd1dHgCie3j8lap/PXrzydA6VvyDw
3606wYhOfKOxnN1ykvLWO5J1FJ96Yrdp9HyWALLA/x7p+IfB8FgBtkMoNJNes8T/
eDBexPtHPepoW8oQ27+3+P3wrz5SNJxPaiXwmmBBAoGAJ1UWBv9jKN+iyvjMRaON
GMdywwNsYM+cqj7zf5boBa4lvLMUZtDw1WOcrIdgH7yl1ozZME082YGRuJXhp9lD
xLZbGiesCNHQQKKN9m7dt7rpU71HVXvBA8Eh08yS+KErpnM9dGoHpMFLAi/28Awm
O69K7/JXKo3moOmrbnikQL4=
-----END PRIVATE KEY-----`;

const DEFAULT_DEV_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoxaCn0hn1usrKPPJttiq
vkzmXCyJa17F5Qfss3gnj3skKpdoyZ6DXk+SP5XX36LHm08ItfskgR9XvVlsawIj
HAgDNV+EbJwSxTiCjd7600XnU4YOMdqtWV4JbbE2ThrYBl80WgOwVkdnnlZPUtJ3
Wjw6MCXJfpqo72K5svyuJwoWbx77eLGXmxem4ADo6/UNwWBXe6vvDJTEXUG4ve4D
74US4893s2HXLo2VO70RNEzn/mAB58HPP6IlUikd6uElZtHWhn6VUHY6gpxt0Vd+
kKEDm6sfVSUYYwpECpIxpmHK0zZb4FOEefDj9TGhJZDHvC9zuvXJBegPgkUpVgpa
1QIDAQAB
-----END PUBLIC KEY-----`;

const parseMultilineKey = (value?: string, fallback?: string): string => {
    if (!value) {
        return fallback ?? '';
    }
    return value.replace(/\\n/g, '\n');
};

export const JWT_ACCESS_TOKEN = {
    PRIVATE_KEY: parseMultilineKey(process.env.JWT_ACCESS_PRIVATE_KEY, DEFAULT_DEV_PRIVATE_KEY),
    PUBLIC_KEY: parseMultilineKey(process.env.JWT_ACCESS_PUBLIC_KEY, DEFAULT_DEV_PUBLIC_KEY),
    EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    ALGORITHM: 'RS256' as const,
} as const;

export const JWT_REFRESH_TOKEN = {
    PRIVATE_KEY: parseMultilineKey(process.env.JWT_REFRESH_PRIVATE_KEY, DEFAULT_DEV_PRIVATE_KEY),
    PUBLIC_KEY: parseMultilineKey(process.env.JWT_REFRESH_PUBLIC_KEY, DEFAULT_DEV_PUBLIC_KEY),
    EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    ALGORITHM: 'RS256' as const,
} as const;

export const REFRESH_TOKEN_COOKIE = {
    NAME: 'refresh_token',
    HTTP_ONLY: true,
    SAME_SITE: (process.env.JWT_REFRESH_COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
    SECURE: process.env.JWT_REFRESH_COOKIE_SECURE === 'true',
    PATH: process.env.JWT_REFRESH_COOKIE_PATH ?? '/auth',
    MAX_AGE_MS: Number(process.env.JWT_REFRESH_COOKIE_MAX_AGE_MS ?? 7 * 24 * 60 * 60 * 1000),
} as const;
