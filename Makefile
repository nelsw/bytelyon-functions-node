include .env

name := ""

delete:
	@printf "➜  %s  %s [\033[35m%s\033[0m]" "🗑️" "delete" ${name}
	@aws lambda delete-function --function-name bytelyon-node-${name} | jq

test:
	@printf "➜  %s  %s [\033[35m%s\033[0m]\n\n" "📊" "test" "*"
	@npx jest

logs:
	@open "https://us-east-1.console.aws.amazon.com/cloudwatch/home#logStream:group=/aws/lambda/bytelyon-node-${name}"

build:
	@printf "➜  %s  %s [\033[35m%s\033[0m]" "🛠" "build" ${name}
	@rm -rf dist
	@esbuild ./src/handler/${name}/index.ts \
		--bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/index.js \
		--external:"chromium-bidi/lib/cjs/cdp/CdpConnection" \
		--external:"chromium-bidi/lib/cjs/bidiMapper/BidiMapper"
	@cd dist && zip -r index.zip index.js*

create: build
	@aws lambda create-function \
		--function-name bytelyon-node-${name} \
		--runtime "nodejs22.x" \
		--role ${ROLE} \
		--zip-file "fileb://dist/index.zip" \
		--handler ${handler} \
		--environment "Variables={$(shell tr '\n' ',' < ./src/handler/${name}/.env)}" > /dev/null

update: build
	@printf "➜  %s  %s [\033[35m%s\033[0m]" "💾" "update" ${name}
	@aws lambda update-function-configuration \
		--function-name bytelyon-node-${name} \
		--role ${ROLE} \
		--timeout "300" \
		--memory-size "2048" \
		--environment "Variables={$(shell tr '\n' ',' < ./src/handler/${name}/.env)}" > /dev/null
