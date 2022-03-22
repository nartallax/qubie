import {ToolboxTransformer} from "@nartallax/toolbox-transformer"
import {Transformer, TransformerParams} from "transformer"
import {QubieTransformerTricks} from "tricks"
import * as Tsc from "typescript"

export default ToolboxTransformer.makeImplodableTransformer<TransformerParams>(opts => {
	let params: TransformerParams = {
		coreModuleName: "@nartallax/qubie",
		coreModuleIdentifier: "__QubieAutogeneratedImport",
		...(opts.params || {})
	}
	return transformContext => {
		let tricks = new QubieTransformerTricks(Tsc, opts.program.getTypeChecker(), transformContext)
		let transformer = new Transformer(tricks, params)
		return sourceFile => transformer.transform(sourceFile)
	}
})