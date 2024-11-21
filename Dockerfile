# go hub binary
FROM golang:alpine as go
RUN apk --update add ca-certificates git
RUN go install github.com/github/hub@latest

# python yq binary
FROM six8/pyinstaller-alpine:alpine-3.6-pyinstaller-v3.4 as yq
ARG YQ_VERSION=2.10.0
ENV PATH="/pyinstaller:$PATH"
RUN pip install yq==${YQ_VERSION}
RUN pyinstaller --noconfirm --onefile --log-level DEBUG --clean --distpath /tmp/ $(which yq)

# kubectl binary
FROM bitnami/kubectl:1.27.4 as kubectl

# Main
FROM node:18.17.1-alpine3.18

RUN apk --update add --no-cache \
    bash \
    ca-certificates \
    curl \
    git \
    jq

COPY --from=go /go/bin/hub /usr/local/bin/hub
COPY --from=yq /tmp/yq /usr/local/bin/yq
COPY --from=kubectl /opt/bitnami/kubectl/bin/kubectl /usr/local/bin/

WORKDIR /cf-cli

COPY package.json yarn.lock check-version.js run-check-version.js /cf-cli/

RUN yarn install --prod --frozen-lockfile && \
    yarn cache clean

COPY . /cf-cli

RUN yarn generate-completion

RUN ln -s $(pwd)/lib/interface/cli/khulnasoft /usr/local/bin/khulnasoft

RUN khulnasoft components update --location components
ENTRYPOINT ["khulnasoft"]
