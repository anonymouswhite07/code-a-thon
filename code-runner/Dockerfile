# Isolated Sandbox Runner with GCC, OpenJDK 17, and Python 3
FROM alpine:3.19

RUN apk add --no-cache \
    nodejs \
    npm \
    gcc \
    g++ \
    musl-dev \
    openjdk17-jdk \
    openjdk17-jre \
    python3

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"

WORKDIR /runner
COPY package.json server.js ./

# Create restricted non-root execution user
RUN addgroup -S runnergroup && adduser -S runneruser -G runnergroup
USER runneruser

EXPOSE 5050
CMD ["node", "server.js"]
